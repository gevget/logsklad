# 06 — DATABASE SCHEMA

## 1. Цель
Предварительная PostgreSQL schema для Demo MVP. UUID — рекомендуемый primary key. Все timestamps — timezone-aware.

## 2. Enums

### user_role
`CLIENT`, `MANAGER`, `DRIVER`, `WAREHOUSE`, `ADMIN`

### order_type
`PICKUP_TO_WAREHOUSE`, `WAREHOUSE_INTAKE`, `DELIVERY_OWN_TRANSPORT`, `DELIVERY_TRANSPORT_COMPANY`, `COURIER_DOCUMENTS`, `WAREHOUSE_SERVICE`

### order_status
`DRAFT`, `SUBMITTED`, `REVIEW`, `CONFIRMED`, `DRIVER_ASSIGNED`, `PICKUP_IN_PROGRESS`, `PICKED_UP`, `AT_WAREHOUSE`, `WAREHOUSE_PROCESSING`, `READY_FOR_DELIVERY`, `DELIVERY_IN_PROGRESS`, `DELIVERED`, `COMPLETED`, `ON_HOLD`, `ISSUE`, `CANCELLED`

### route_point_type
`PICKUP`, `WAREHOUSE`, `DELIVERY`, `TERMINAL`, `OTHER`

### comment_scope
`INTERNAL`, `CLIENT_VISIBLE`

### attachment_category
`CARGO_PHOTO`, `WAREHOUSE_PHOTO`, `DOCUMENT`, `INVOICE`, `PROOF_OF_DELIVERY`, `OTHER`

## 3. companies
```text
id uuid pk
display_name varchar not null
legal_name varchar
inn varchar
email varchar
phone varchar
billing_details jsonb
is_active boolean default true
created_at timestamptz
updated_at timestamptz
```

## 4. users
```text
id uuid pk
company_id uuid nullable fk -> companies.id
role user_role not null
name varchar not null
email varchar unique not null
phone varchar
avatar_url varchar
is_active boolean default true
created_at timestamptz
updated_at timestamptz
```

## 5. driver_profiles
```text
id uuid pk
user_id uuid unique not null fk -> users.id
license_number varchar nullable
notes text
is_available boolean default true
created_at timestamptz
updated_at timestamptz
```

## 6. vehicles
```text
id uuid pk
name varchar not null
vehicle_type varchar
plate_number varchar unique
capacity_kg integer
volume_m3 numeric
is_active boolean default true
created_at timestamptz
updated_at timestamptz
```

## 7. warehouses
```text
id uuid pk
name varchar not null
address_text text not null
phone varchar
working_hours varchar
is_active boolean default true
created_at timestamptz
updated_at timestamptz
```

## 8. suppliers
```text
id uuid pk
company_id uuid not null fk -> companies.id
name varchar not null
inn varchar
contact_name varchar
phone varchar
email varchar
address_text text
notes text
created_at timestamptz
updated_at timestamptz
```

## 9. orders
```text
id uuid pk
number varchar unique not null
company_id uuid not null fk -> companies.id
created_by_user_id uuid not null fk -> users.id
manager_user_id uuid nullable fk -> users.id
driver_user_id uuid nullable fk -> users.id
vehicle_id uuid nullable fk -> vehicles.id
warehouse_id uuid nullable fk -> warehouses.id

type order_type not null
status order_status not null default DRAFT

title varchar
description text
client_reference varchar
external_carrier_name varchar nullable
external_payer varchar nullable
transport_destination_city varchar nullable
document_set_count integer nullable
return_documents boolean default false

subtotal numeric default 0
services_total numeric default 0
insurance_total numeric default 0
discount_total numeric default 0
tax_total numeric default 0
total numeric default 0
currency varchar default 'RUB'

planned_pickup_at timestamptz nullable
planned_delivery_at timestamptz nullable
completed_at timestamptz nullable

created_at timestamptz
updated_at timestamptz
```

Типовые поля перевозчика и доставки документов заполняются только для соответствующих `order_type`; остальные заявки оставляют их пустыми.

Indexes: company_id, status, type, manager_user_id, driver_user_id, created_at.

## 10. cargo_items
```text
id uuid pk
order_id uuid not null fk -> orders.id
supplier_id uuid nullable fk -> suppliers.id
title varchar not null
category varchar
description text
quantity numeric default 1
unit varchar
places integer
weight_kg numeric
length_cm numeric
width_cm numeric
height_cm numeric
declared_value numeric
special_requirements text
created_at timestamptz
updated_at timestamptz
```

## 11. route_points
```text
id uuid pk
order_id uuid not null fk -> orders.id
sequence integer not null
type route_point_type not null
label varchar
address_text text not null
contact_name varchar
contact_phone varchar
planned_at timestamptz nullable
arrived_at timestamptz nullable
completed_at timestamptz nullable
notes text
created_at timestamptz
updated_at timestamptz
```

Рекомендуемый unique: `(order_id, sequence)`.

## 12. services
```text
id uuid pk
code varchar unique not null
name varchar not null
description text
unit varchar
base_price numeric nullable
is_active boolean default true
created_at timestamptz
updated_at timestamptz
```

## 13. order_services
```text
id uuid pk
order_id uuid not null fk -> orders.id
service_id uuid not null fk -> services.id
quantity numeric default 1
unit_price numeric default 0
total_price numeric default 0
is_completed boolean default false
notes text
created_at timestamptz
updated_at timestamptz
```

## 14. warehouse_operations
```text
id uuid pk
order_id uuid not null fk -> orders.id
warehouse_id uuid not null fk -> warehouses.id
performed_by_user_id uuid not null fk -> users.id
operation_type varchar not null
quantity numeric nullable
weight_kg numeric nullable
result_text text
notes text
performed_at timestamptz
created_at timestamptz
```

## 15. attachments
```text
id uuid pk
order_id uuid nullable fk -> orders.id
warehouse_operation_id uuid nullable fk -> warehouse_operations.id
uploaded_by_user_id uuid not null fk -> users.id
category attachment_category not null
filename varchar not null
storage_path text not null
mime_type varchar
size_bytes bigint
created_at timestamptz
```

## 16. documents
```text
id uuid pk
order_id uuid not null fk -> orders.id
attachment_id uuid nullable fk -> attachments.id
document_type varchar not null
document_number varchar
issued_at timestamptz nullable
title varchar not null
notes text
created_at timestamptz
updated_at timestamptz
```

## 17. comments
```text
id uuid pk
order_id uuid not null fk -> orders.id
author_user_id uuid not null fk -> users.id
scope comment_scope not null
body text not null
created_at timestamptz
updated_at timestamptz
```

## 18. status_history
```text
id uuid pk
order_id uuid not null fk -> orders.id
from_status order_status nullable
to_status order_status not null
changed_by_user_id uuid not null fk -> users.id
note text
created_at timestamptz
```

## 19. notifications
```text
id uuid pk
user_id uuid not null fk -> users.id
order_id uuid nullable fk -> orders.id
type varchar not null
title varchar not null
body text
is_read boolean default false
created_at timestamptz
read_at timestamptz nullable
```

## 20. audit_logs
```text
id uuid pk
actor_user_id uuid nullable fk -> users.id
entity_type varchar not null
entity_id uuid nullable
action varchar not null
payload jsonb
created_at timestamptz
```

## 21. Data integrity
Обязательно:
- foreign keys;
- unique order number;
- indexes по частым filters;
- server validation поверх DB constraints.

Не использовать JSONB вместо нормальных таблиц для cargo, route points, services и status history.
JSONB допустим для billing details, audit payload и future integration metadata.
