# 💼 Billing Management System

A comprehensive web-based billing management application for tracking employee billing, leaves, holidays, and generating detailed reports.

## 🚀 Features

- **Role Management**: Define roles with hourly rates in USD
- **Employee Management**: Add employees with billing start dates
- **Holiday Management**: Bulk import holidays by calendar year
- **Leave Tracking**: Track full-day and half-day leaves
- **Automatic Billing**: Calculate billing with automatic weekend/holiday/leave deductions
- **Monthly Dashboard**: View billing overview month-by-month
- **Custom Reports**: Generate reports for any date range
- **Export Options**: Export reports as PDF or XLSX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **No Installation Required**: Share link for instant access

## 📋 Requirements

- Python 3.8 or higher
- pip (Python package manager)

## 🛠️ Local Setup

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Run the Application**
```bash
python app.py
```

3. **Access the Application**
Open your browser and navigate to:
```
http://localhost:5000
```

## 🌐 Deployment Options

### Option 1: Render.com (Recommended - Free Tier)

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: billing-app
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Add `gunicorn` to requirements.txt:
```bash
echo "gunicorn==21.2.0" >> requirements.txt
```
6. Deploy and get your public URL!

### Option 2: PythonAnywhere (Free Tier)

1. Create account at [pythonanywhere.com](https://www.pythonanywhere.com)
2. Upload files via "Files" tab
3. Open Bash console and install dependencies:
```bash
pip install --user -r requirements.txt
```
4. Go to "Web" tab → "Add a new web app"
5. Choose Flask and configure paths
6. Reload and access your app URL

### Option 3: Railway.app

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Python and deploys
5. Get your public URL from deployment

### Option 4: Heroku

1. Install Heroku CLI
2. Create `Procfile`:
```
web: gunicorn app:app
```
3. Deploy:
```bash
heroku login
heroku create billing-app
git push heroku main
```

## 📖 Usage Guide

### 1. Setup Roles
- Navigate to "Roles" tab
- Add roles (e.g., Developer, Manager, Designer)
- Set hourly rates in USD

### 2. Add Employees
- Go to "Employees" tab
- Enter employee name, select role, set billing start date
- Mark as active/inactive

### 3. Configure Holidays
- Open "Holidays" tab
- Enter year and add multiple holiday dates
- Holidays apply to all employees

### 4. Track Leaves
- Visit "Leaves" tab
- Select employee and leave date
- Choose full-day or half-day leave

### 5. View Dashboard
- "Dashboard" tab shows monthly billing
- Select month to view calculations
- Use "Recalculate All" to refresh data

### 6. Generate Reports
- Go to "Reports" tab
- Select custom date range
- Click "Calculate Billing" to preview
- Export as PDF or XLSX

## 🧮 Billing Calculation Logic

```
Working Days = Total Days - Weekends - Holidays - Leaves
Billing Amount = Working Days × 8 hours × Hourly Rate
```

**Deductions:**
- Saturdays and Sundays (automatic)
- Company holidays (global)
- Employee leaves (full day = 1 day, half day = 0.5 day)

**Adjustments:**
- Billing starts from employee's start date
- Only active employees included in calculations

## 🔒 Security Notes

- This app has no authentication (link-based access)
- For production use, consider adding:
  - User authentication
  - Role-based access control
  - HTTPS encryption
  - Database backups

## 📁 Project Structure

```
billing-app/
├── app.py                 # Flask application
├── models.py              # Database models
├── utils.py               # Billing calculations
├── requirements.txt       # Dependencies
├── database.db            # SQLite database (auto-created)
├── static/
│   ├── css/style.css     # Styling
│   └── js/app.js         # Frontend logic
└── templates/
    └── index.html        # Main UI
```

## 🐛 Troubleshooting

**Database not created?**
- Ensure write permissions in app directory
- Check Python version (3.8+)

**Port already in use?**
- Change port in app.py: `app.run(port=5001)`

**Export not working?**
- Verify openpyxl and reportlab are installed
- Check browser download settings

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review deployment platform documentation
3. Verify all dependencies are installed

## 📄 License

This project is open-source and available for personal and commercial use.

---

**Built with Flask, SQLite, and modern web technologies** 🚀
