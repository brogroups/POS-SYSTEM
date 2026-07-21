<template>
  <!-- seats <= 2 -->
  <svg v-if="seats <= 2" width="100%" height="100%" viewBox="0 0 100 100" :class="['transition-all duration-300', glowClass]">
    <!-- Chairs -->
    <rect x="12" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="76" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <!-- Table -->
    <circle cx="50" cy="50" r="24" :fill="mainColor" :stroke="isSelected ? '#38bdf8' : 'none'" stroke-width="3" class="transition-all duration-300 shadow-md" />
    <!-- Label -->
    <text x="50" y="55" text-anchor="middle" fill="#ffffff" class="font-extrabold text-sm select-none pointer-events-none">{{ tableNumber }}</text>
  </svg>

  <!-- seats <= 4 -->
  <svg v-else-if="seats <= 4" width="100%" height="100%" viewBox="0 0 100 100" :class="['transition-all duration-300', glowClass]">
    <!-- Chairs -->
    <rect x="42" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="42" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="10" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="78" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <!-- Table -->
    <rect x="28" y="28" width="44" height="44" rx="10" :fill="mainColor" :stroke="isSelected ? '#38bdf8' : 'none'" stroke-width="3" class="transition-all duration-300 shadow-md" />
    <!-- Label -->
    <text x="50" y="55" text-anchor="middle" fill="#ffffff" class="font-extrabold text-sm select-none pointer-events-none">{{ tableNumber }}</text>
  </svg>

  <!-- seats <= 6 -->
  <svg v-else-if="seats <= 6" width="100%" height="100%" viewBox="0 0 120 100" :class="['transition-all duration-300', glowClass]">
    <!-- Chairs -->
    <rect x="40" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="64" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="40" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="64" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="10" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="98" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <!-- Table -->
    <rect x="28" y="28" width="64" height="44" rx="10" :fill="mainColor" :stroke="isSelected ? '#38bdf8' : 'none'" stroke-width="3" class="transition-all duration-300 shadow-md" />
    <!-- Label -->
    <text x="60" y="55" text-anchor="middle" fill="#ffffff" class="font-extrabold text-sm select-none pointer-events-none">{{ tableNumber }}</text>
  </svg>

  <!-- seats <= 8 -->
  <svg v-else-if="seats <= 8" width="100%" height="100%" viewBox="0 0 140 100" :class="['transition-all duration-300', glowClass]">
    <!-- Chairs -->
    <rect x="42" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="62" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="82" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="42" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="62" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="82" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="12" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="116" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <!-- Table -->
    <rect x="30" y="28" width="80" height="44" rx="10" :fill="mainColor" :stroke="isSelected ? '#38bdf8' : 'none'" stroke-width="3" class="transition-all duration-300 shadow-md" />
    <!-- Label -->
    <text x="70" y="55" text-anchor="middle" fill="#ffffff" class="font-extrabold text-sm select-none pointer-events-none">{{ tableNumber }}</text>
  </svg>

  <!-- seats > 8 -->
  <svg v-else width="100%" height="100%" viewBox="0 0 160 100" :class="['transition-all duration-300', glowClass]">
    <!-- Chairs -->
    <rect x="38" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="58" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="78" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="98" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="118" y="10" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="38" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="58" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="78" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="98" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="118" y="78" width="16" height="12" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="12" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <rect x="136" y="42" width="12" height="16" rx="3" :fill="chairColor" class="transition-all duration-300" />
    <!-- Table -->
    <rect x="30" y="28" width="100" height="44" rx="10" :fill="mainColor" :stroke="isSelected ? '#38bdf8' : 'none'" stroke-width="3" class="transition-all duration-300 shadow-md" />
    <!-- Label -->
    <text x="80" y="55" text-anchor="middle" fill="#ffffff" class="font-extrabold text-sm select-none pointer-events-none">{{ tableNumber }}</text>
  </svg>
</template>

<script>
export default {
  name: "TableIcon",
  props: {
    seats: {
      type: Number,
      required: true,
    },
    tableNumber: {
      type: [Number, String],
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    glowClass() {
      if (this.isSelected) return "drop-shadow-[0_0_16px_rgba(56,189,248,0.95)] scale-105 z-10";
      if (this.status === "MULTI_SESSION") return "drop-shadow-[0_0_14px_rgba(168,85,247,0.95)] animate-pulse";
      return "";
    },
    mainColor() {
      if (this.status === "MULTI_SESSION") return "#a855f7";
      if (this.status === "OCCUPIED") return "#ef4444";
      if (this.status === "RESERVED") return "#f59e0b";
      return "#10b981";
    },
    chairColor() {
      if (this.status === "MULTI_SESSION") return "#7e22ce";
      if (this.status === "OCCUPIED") return "#b91c1c";
      if (this.status === "RESERVED") return "#b45309";
      return "#047857";
    },
  },
};
</script>
