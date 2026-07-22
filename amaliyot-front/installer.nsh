!macro customInit
  nsExec::Exec `taskkill /F /IM "${PRODUCT_FILENAME}.exe"`
  nsExec::Exec `taskkill /F /IM "Ohlala POS.exe"`
  nsExec::Exec `taskkill /F /IM "Kitchen App.exe"`
!macroend
