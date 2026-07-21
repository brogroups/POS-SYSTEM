import mongoose, { Model } from 'mongoose';

export function translateWhere(where: any) {
  if (!where) return {};
  const query = { ...where };
  if (query.id) {
    query._id = query.id;
    delete query.id;
  }
  return query;
}

export function translateInclude(include: any): any {
  if (!include) return null;
  const populateOptions: any[] = [];
  for (const key of Object.keys(include)) {
    const val = include[key];
    if (val === true) {
      populateOptions.push({ path: key });
    } else if (typeof val === 'object') {
      const option: any = { path: key };
      if (val.include) {
        option.populate = translateInclude(val.include);
      }
      populateOptions.push(option);
    }
  }
  return populateOptions.length === 1 ? populateOptions[0] : populateOptions;
}

export function formatDoc(doc: any): any {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.map(formatDoc);
  }
  if (typeof doc.toObject === 'function') {
    const obj = doc.toObject({ virtuals: true, getters: true });
    if (obj._id) {
      obj.id = obj._id.toString();
    }
    return obj;
  }
  return doc;
}

export function createModelWrapper(mongooseModel: Model<any>) {
  return {
    findMany: async (args?: any) => {
      const where = translateWhere(args?.where);
      let query = mongooseModel.find(where);
      if (args?.include) {
        query = query.populate(translateInclude(args.include));
      }
      const data = await query.exec();
      return formatDoc(data);
    },
    findUnique: async (args: any) => {
      const where = translateWhere(args?.where);
      let query = mongooseModel.findOne(where);
      if (args?.include) {
        query = query.populate(translateInclude(args.include));
      }
      const data = await query.exec();
      return formatDoc(data);
    },
    findFirst: async (args?: any) => {
      const where = translateWhere(args?.where);
      let query = mongooseModel.findOne(where);
      if (args?.include) {
        query = query.populate(translateInclude(args.include));
      }
      const data = await query.exec();
      return formatDoc(data);
    },
    create: async (args: any) => {
      const data = await mongooseModel.create(args.data);
      return formatDoc(data);
    },
    update: async (args: any) => {
      const where = translateWhere(args?.where);
      const data = await mongooseModel.findOneAndUpdate(where, args.data, { new: true }).exec();
      return formatDoc(data);
    },
    delete: async (args: any) => {
      const where = translateWhere(args?.where);
      const data = await mongooseModel.findOneAndDelete(where).exec();
      return formatDoc(data);
    },
    count: async (args?: any) => {
      const where = translateWhere(args?.where);
      return mongooseModel.countDocuments(where).exec();
    },
    deleteMany: async (args?: any) => {
      const where = translateWhere(args?.where);
      return mongooseModel.deleteMany(where).exec();
    },
    updateMany: async (args: any) => {
      const where = translateWhere(args?.where);
      return mongooseModel.updateMany(where, args.data).exec();
    }
  };
}
