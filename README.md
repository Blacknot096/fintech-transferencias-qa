# Prototipo de transferencias FinTech

Prototipo de la funcionalidad **evaluación de transferencias de fondos** de una FinTech. Se desarrolló
con TDD, linters y una pirámide de automatización de pruebas, sin depender de pruebas manuales.

## Funcionalidad

`evaluarTransferencia(solicitud)` decide si una transferencia se aprueba, se rechaza o requiere una
verificación adicional, y calcula la comisión y el total debitado. Todos los montos se manejan en
centavos (enteros) para evitar errores de punto flotante.

| Regla                   | Detalle                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Comisión                | Mismo banco 0 %; interbancaria 0.5 % (mín. Q5.00); internacional 1.5 % (mín. Q50.00) |
| Límite por transacción  | Ahorro Q10,000; Monetaria Q50,000; Empresarial Q500,000                              |
| Canal API               | Solo para cuentas empresariales                                                      |
| Internacional           | Solo en USD                                                                          |
| Saldo                   | Debe cubrir el monto más la comisión                                                 |
| Autenticación reforzada | Montos mayores a Q10,000 con contraseña + OTP requieren verificación                 |

La misma lógica se expone por HTTP en `POST /api/transferencias` (`npm start`).

## Requisitos

Node.js 20 o superior.

```bash
npm install
```

## Comandos

| Comando                    | Descripción                                          |
| -------------------------- | ---------------------------------------------------- |
| `npm run lint`             | Análisis estático con ESLint                         |
| `npm run format:check`     | Verificación de formato con Prettier                 |
| `npm test`                 | Toda la suite de pruebas                             |
| `npm run test:unit`        | Pruebas unitarias                                    |
| `npm run test:integracion` | Pruebas de integración (casos pairwise)              |
| `npm run test:e2e`         | Pruebas de extremo a extremo contra el servidor HTTP |
| `npm run test:cobertura`   | Suite completa con cobertura (umbral mínimo de 90 %) |
| `npm run pairwise`         | Genera los casos pairwise y verifica la cobertura    |
| `npm run verificar`        | Linter, formato y pruebas con cobertura              |

Un hook de `pre-commit` (Husky) ejecuta el linter, el formato y las pruebas antes de cada commit.

## Estructura

```
src/            Código de producción (comisiones, transferencias, servidor HTTP)
herramientas/   Generador de casos pairwise
pruebas/
  unitarias/    Base de la pirámide
  integracion/  Casos pairwise ejecutados contra el motor de reglas
  e2e/          Flujo completo por HTTP
```

## TDD

El historial de commits refleja el ciclo rojo, verde y refactorización: cada funcionalidad tiene
primero un commit `test:` con las pruebas fallando y luego el commit `feat:` que las hace pasar.
