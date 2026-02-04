# 🚀 Quick Start Guide - Hostel Khata Mobile App

## ✅ Installation Complete!

Your mobile app is now ready to run with **1247 packages installed**.

---

## 📱 How to Run the App

### Step 1: Start the Development Server
```bash
cd mobile
npm start
```

This will open **Expo Dev Tools** in your browser.

### Step 2: Run on Your Device

#### Option A: Physical Device (Recommended)
1. Install **Expo Go** app from:
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
   - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)
2. Scan the QR code shown in terminal/browser
3. App will load on your phone!

#### Option B: Android Emulator
```bash
npm run android
```
(Requires Android Studio and emulator setup)

#### Option C: iOS Simulator (macOS only)
```bash
npm run ios
```
(Requires Xcode)

---

## 🎯 What to Test

### 1. **Register Flow**
- Open app → Tap "Sign Up"
- Fill in: Name, Email, Password
- Tap "Create Account"
- Should auto-login to Dashboard

### 2. **Login Flow**
- Use credentials from registration
- Tap "Sign In"
- Should navigate to Dashboard

### 3. **Navigation**
- Bottom tabs should work:
  - 🏠 Dashboard
  - 👥 Groups (placeholder)
  - 👤 Profile

### 4. **Profile & Logout**
- Go to Profile tab
- See your name and email
- Tap "Logout" → Confirm
- Should return to Login screen

### 5. **Auto-Login**
- Close app completely
- Reopen app
- Should skip Login and go straight to Dashboard

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to Metro"
**Solution**: Make sure you're on the same WiFi network as your computer

### Issue: "Network request failed"
**Solution**: The app is connected to production API (`api-hostelkhata.xivra.pk`), ensure you have internet connection

### Issue: App crashes on startup
**Solution**: 
```bash
# Clear cache and restart
npm start --clear
```

### Issue: "Execution policy" error
**Solution**: Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## 📊 Current Features

| Feature | Status |
|---------|--------|
| **Login** | ✅ Working with API |
| **Register** | ✅ Working with API |
| **Auto-Login** | ✅ Token persistence |
| **Dashboard** | ✅ Beautiful UI |
| **Profile** | ✅ User info + Logout |
| **Navigation** | ✅ Bottom tabs |
| **Groups** | ⏳ Coming in Phase 4 |
| **Transactions** | ⏳ Coming in Phase 4 |

---

## 🌐 API Connection

- **Endpoint**: `https://api-hostelkhata.xivra.pk/api`
- **Auth**: `/auth/login`, `/auth/register`
- **Token Storage**: AsyncStorage (persistent)

---

## 📝 Development Tips

### Hot Reload
- Shake your device → "Reload"
- Or press `r` in terminal

### Debug Menu
- Shake device → "Debug Remote JS"
- Opens Chrome DevTools

### View Logs
- Terminal shows console.log output
- Errors appear in red

---

## 🎨 Design Highlights

- ✨ **Gradient Headers**: Beautiful violet gradients
- 📱 **Native Feel**: Not a web view!
- 🎯 **Touch Optimized**: 44pt minimum touch targets
- 💫 **Smooth Animations**: Native transitions
- 🎨 **Consistent Theme**: Slate & Violet palette

---

## 🚀 Next Steps (Phase 4)

Once you've tested the current features, we'll build:
1. **Groups List**: View all your groups
2. **Group Details**: Members, balances, transactions
3. **Add Expense**: Create new expenses
4. **Transaction History**: View all transactions
5. **Settlement Flow**: Settle balances

---

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Clear cache: `npm start --clear`
3. Reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`

---

**Happy Testing! 🎉**

Repository: https://github.com/smarthashmi/hostel_khata_mobileapp
