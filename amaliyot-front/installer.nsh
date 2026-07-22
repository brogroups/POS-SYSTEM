!macro customInit
  nsExec::Exec `taskkill /F /IM "Kitchen App.exe"`
  nsExec::Exec `taskkill /F /IM "Ohlala POS.exe"`
  nsExec::Exec `taskkill /F /IM "ohlala-front.exe"`
!macroend

!macro customInstall
  nsExec::Exec `taskkill /F /IM "Kitchen App.exe"`
  nsExec::Exec `taskkill /F /IM "Ohlala POS.exe"`
  nsExec::Exec `taskkill /F /IM "ohlala-front.exe"`
!macroend
