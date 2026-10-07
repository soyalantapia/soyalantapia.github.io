# Escaleta

En línea: https://soyalantapia.github.io/escaleta-61ca1c35302c6a0f/

Un tema por pantalla para grabar clips sin perder el hilo. Abajo, tres botones:
**ANTERIOR**, **SALTAR** y **GRABADO**. Tocando el contador de arriba ves todos los temas y saltás
a cualquiera.

Cada tema arranca con **la pregunta**: lo que te preguntaría un entrevistador. Como en el estudio no
hay nadie, es el empujón para arrancar: el gancho es tu respuesta.

Arriba hay dos modos:

- **ENTENDER**, para prepararte: la pregunta, el tema y su ángulo, **el potencial viral** (de 1 a 10)
  y **por qué pega**, el gancho, **la polémica**, **de qué se trata**, **por qué te escucha**, los
  puntos a tocar, el cierre y a quién le estás hablando.
- **GRABAR**, para el estudio: sólo la pregunta, el tema, el gancho, los puntos a tocar, el cierre y
  a quién le estás hablando.

## Instalarla en el celular

- **Android (Chrome):** abrí el link, menú ⋮ y **Instalar app** (o *Agregar a la pantalla principal*).
- **iPhone (Safari):** abrí el link, botón **Compartir** y **Agregar a inicio**.

Después de abrirla una vez con internet, funciona sin conexión. Lo que marcás como grabado o
saltado queda guardado en ese teléfono. Mientras está abierta, la pantalla no se apaga.

## Cambiar los guiones

Todo el contenido está en [`guiones.json`](guiones.json). Cada tema es así:

```json
{
  "id": "la-mora",
  "planilla": 89,
  "tema": "La mora",
  "pregunta": "Lo que te preguntaría el entrevistador, para que el gancho sea tu respuesta.",
  "angulo": "",
  "gancho": "La primera frase, tal cual se dice.",
  "polemica": "La postura, y quién te la va a discutir.",
  "insight": "De qué se trata, explicado para entenderlo y poder improvisar.",
  "objetivo": "Que el que te escucha se lleve algo concreto.",
  "puntos": ["Primer punto.", "Segundo punto.", "Tercer punto."],
  "cierre": "La última frase, tal cual se dice.",
  "a_quien": "El fundador de una fintech.",
  "si_hay_tiempo": false,
  "viral": 9,
  "por_que_pega": "Por qué ese clip se va a compartir, en una línea.",
  "bloque": "Fintech"
}
```

- `id` no se cambia nunca: es lo que recuerda si un tema ya está grabado.
- El orden de la lista es el orden de la grabación. Primero van los de hoy, agrupados por `bloque`;
  después los que son `si_hay_tiempo`, del que más pega al que menos.
- `viral` es una estimación de 1 a 10 de cuánto puede circular el clip, no una medición.
- `planilla` es el número del guion en la planilla de evaluación.
- `angulo` sólo se completa cuando la misma postura se graba desde varios ángulos.

Cuando se sube un `guiones.json` nuevo, la app lo toma sola la próxima vez que se abre con internet.

## Técnica

HTML, CSS y JavaScript sin dependencias. Las tipografías (Barlow Condensed y Atkinson
Hyperlegible, licencia SIL Open Font License) están incluidas para que funcione sin internet.
