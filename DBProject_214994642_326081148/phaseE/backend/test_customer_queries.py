from customer_queries import get_all_customers

customers = get_all_customers()

print("Customers:")
for customer in customers:
    print(customer)