# Ficha de negocio — OdontoTurno (Módulo 1)

## A. Emprendimiento
- **Nombre:** OdontoTurno
- **Rubro:** Salud — Odontología
- **Propuesta de valor:** Reserva online de turnos odontológicos con confirmación inmediata, control de cupos y descuentos automáticos, evitando la agenda manual por teléfono o WhatsApp.

## B. Cliente ideal
- **Edad / hábitos:** Adultos de 18 a 55 años, usuarios de celular, que agendan fuera del horario de recepción.
- **Necesidad:** Saber al instante si hay lugar y recibir confirmación sin esperar respuesta humana.

## C. Catálogo de servicios
1. Consulta y diagnóstico | 30 min | $15.000
2. Limpieza profesional | 45 min | $22.000
3. Blanqueamiento dental | 60 min | $45.000
4. Control de ortodoncia | 30 min | $18.000

## Diccionario de datos (variables clave)

| Variable | Tipo | Ejemplo | Función |
|---|---|---|---|
| nombreCliente | String | "Mariana Rossi" | Identifica al paciente |
| telefonoCliente | String | "1122334455" | Contacto / recordatorios |
| emailCliente | String | "mariana@mail.com" | Identificador único |
| servicioSeleccionado | String | "limpieza" | Código del tratamiento |
| precioBase | Number | 22000 | Precio sin descuentos |
| duracionMinutos | Number | 45 | Bloqueo de agenda |
| fechaTurno | String/Date | "2026-10-15" | Día de la cita |
| horaTurno | String | "10:00" | Hora de inicio |
| codigoCupon | String | "PROMO20" | Descuento opcional |
| esClienteVIP | Boolean | true | Beneficio frecuente |
| turnoConfirmado | Boolean | false | Estado del proceso |

## Reglas de negocio
1. **Cupo:** Si ya existe un turno CONFIRMADO/PENDIENTE en la misma fecha y hora, se rechaza la reserva.
2. **Descuento:** Si `codigoCupon == "PROMO20"` O `esClienteVIP == true`, se aplica 20% sobre el precio base.
