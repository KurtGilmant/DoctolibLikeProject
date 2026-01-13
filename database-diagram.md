# Diagramme de base de données - Garage Booking

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SCHÉMA DE BASE DE DONNÉES                       │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       User           │
├──────────────────────┤
│ id (PK)              │
│ email (unique)       │
│ password             │
│ firstName            │
│ lastName             │
│ phone                │
│ role (enum)          │──┐
│ createdAt            │  │
│ updatedAt            │  │
└──────────────────────┘  │
         │                │
         │ 1:N            │ 1:1
         │                │
         ▼                ▼
┌──────────────────────┐  ┌──────────────────────┐
│      Booking         │  │       Garage         │
├──────────────────────┤  ├──────────────────────┤
│ id (PK)              │  │ id (PK)              │
│ userId (FK)          │  │ name                 │
│ garageId (FK)        │◄─┤ description          │
│ serviceId (FK)       │  │ address              │
│ slotId (FK, unique)  │  │ city                 │
│ status (enum)        │  │ postalCode           │
│ notes                │  │ latitude             │
│ createdAt            │  │ longitude            │
│ updatedAt            │  │ phone                │
└──────────────────────┘  │ email                │
         │                │ ownerId (FK, unique) │
         │                │ createdAt            │
         │                │ updatedAt            │
         │                └──────────────────────┘
         │                         │
         │                         │ 1:N
         │                         ▼
         │                ┌──────────────────────┐
         │                │      Service         │
         │                ├──────────────────────┤
         │                │ id (PK)              │
         └───────────────►│ garageId (FK)        │
                   1:N    │ type (enum)          │
                          │ name                 │
                          │ description          │
                          │ price                │
                          │ duration             │
                          │ createdAt            │
                          │ updatedAt            │
                          └──────────────────────┘

         ┌──────────────────────┐
         │        Slot          │
         ├──────────────────────┤
         │ id (PK)              │
         │ garageId (FK)        │◄─────┐
         │ startTime            │      │ 1:N
         │ endTime              │      │
         │ isBooked             │      │
         │ createdAt            │      │
         │ updatedAt            │      │
         └──────────────────────┘      │
                  │                    │
                  │ 1:1                │
                  │                    │
                  └────────────────────┘


ENUMS:

UserRole:
  - USER
  - PROFESSIONAL

BookingStatus:
  - PENDING
  - CONFIRMED
  - CANCELLED
  - COMPLETED

ServiceType:
  - VIDANGE
  - REVISION
  - PNEUS
  - DIAGNOSTIC
  - FREINAGE
  - CARROSSERIE
  - CLIMATISATION
  - AUTRE


RELATIONS:

1. User (1) -> (N) Booking
   Un utilisateur peut avoir plusieurs réservations

2. User (1) -> (1) Garage
   Un professionnel possède un garage

3. Garage (1) -> (N) Service
   Un garage propose plusieurs services

4. Garage (1) -> (N) Slot
   Un garage a plusieurs créneaux horaires

5. Garage (1) -> (N) Booking
   Un garage reçoit plusieurs réservations

6. Service (1) -> (N) Booking
   Un service peut être réservé plusieurs fois

7. Slot (1) -> (1) Booking
   Un créneau ne peut avoir qu'une seule réservation
```
