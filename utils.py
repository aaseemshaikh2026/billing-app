from datetime import datetime, timedelta
from calendar import monthrange
from models import Employee, Leave, Holiday

def get_working_days(employee_id, start_date, end_date):
    employee = Employee.query.get(employee_id)
    if not employee:
        return 0

    if start_date < employee.billing_start_date:
        start_date = employee.billing_start_date
    if start_date > end_date:
        return 0

    holidays = Holiday.query.filter(
        Holiday.client_id == employee.client_id,
        Holiday.holiday_date >= start_date,
        Holiday.holiday_date <= end_date
    ).all()
    holiday_dates = {h.holiday_date for h in holidays}

    leaves = Leave.query.filter(
        Leave.employee_id == employee_id,
        Leave.leave_date >= start_date,
        Leave.leave_date <= end_date
    ).all()
    leave_dict = {l.leave_date: 0.5 if l.is_half_day else 1.0 for l in leaves}

    working_days = 0
    current = start_date
    while current <= end_date:
        if current.weekday() < 5 and current not in holiday_dates:
            working_days += (1 - leave_dict.get(current, 0))
        current += timedelta(days=1)

    return working_days

def calculate_billing(employee_id, start_date, end_date):
    employee = Employee.query.get(employee_id)
    if not employee:
        return 0, 0
    working_days = get_working_days(employee_id, start_date, end_date)
    return working_days, working_days * 8 * employee.role.hourly_rate_usd

def get_date_range_billing(employee_id, start_date, end_date):
    employee = Employee.query.get(employee_id)
    if not employee:
        return None
    working_days, billing_amount = calculate_billing(employee_id, start_date, end_date)
    return {
        'employee_name': employee.name,
        'role': employee.role.role_name,
        'hourly_rate': employee.role.hourly_rate_usd,
        'start_date': start_date,
        'end_date': end_date,
        'working_days': working_days,
        'billing_amount': billing_amount
    }
