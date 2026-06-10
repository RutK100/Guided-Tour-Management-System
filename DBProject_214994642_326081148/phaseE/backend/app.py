# ספרייה ליצירת חלונות גרפיים
import tkinter as tk

# ספרייה לטבלאות ורכיבים גרפיים מתקדמים
from tkinter import ttk

# פונקציה שכתבנו קודם שמביאה את כל הלקוחות מהדאטאבייס
from customer_queries import get_all_customers


# פונקציה שטוענת את הלקוחות לטבלה
def load_customers():

    # ניקוי הטבלה לפני טעינה מחדש
    for row in customers_table.get_children():
        customers_table.delete(row)

    # שליפת הלקוחות מהדאטאבייס
    customers = get_all_customers()

    # הכנסת כל לקוח לטבלה
    for customer in customers:
        customers_table.insert("", tk.END, values=customer)


# יצירת החלון הראשי
root = tk.Tk()

# כותרת החלון
root.title("SweetTour - Guided Tour Management System")

# גודל החלון
root.geometry("1000x600")


# יצירת כותרת גדולה בראש המסך
title = tk.Label(
    root,
    text="SweetTour - Customers",
    font=("Arial", 20, "bold")
)

title.pack(pady=20)


# שמות העמודות בטבלה
columns = (
    "ID",
    "Full Name",
    "Phone",
    "Email",
    "Birth Date"
)


# יצירת טבלה
customers_table = ttk.Treeview(
    root,
    columns=columns,
    show="headings"
)


# יצירת כותרת לכל עמודה
for col in columns:
    customers_table.heading(col, text=col)

    # רוחב העמודה
    customers_table.column(col, width=180)


# הצגת הטבלה במסך
customers_table.pack(
    fill=tk.BOTH,
    expand=True,
    padx=20,
    pady=20
)


# כפתור שמרענן את רשימת הלקוחות
refresh_button = tk.Button(
    root,
    text="Load Customers",
    command=load_customers
)

refresh_button.pack(pady=10)


# טעינה ראשונית של הלקוחות ברגע שהחלון נפתח
load_customers()


# הפעלת החלון
root.mainloop()