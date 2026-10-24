# Cel Trencat

RPG multijugador en 3D de màgia i lluita, d'estil anime, per a navegador.
Fins a 4 jugadors per sala.

Modes de joc:
- **Mode història** (sol o en equip): el món obert amb missions, fortaleses i caps
- **Hordes** (sol o en equip): onades d'enemics cada cop més forts; un cap cada 5 onades
- **Cacera de caps** (sol o en equip): els 7 caps seguits, contra rellotge
- **Contrarellotge** (sol o en equip): 3 minuts per fer tants punts com puguis, amb ratxes
- **Parkour** (sol o en cursa amb amics): 5 nivells que s'obren l'un rere l'altre (Camí dels Vents, Jardins Penjants, Torres de Cristall, Ruta del Llamp i Cim de l'Àliga) amb plataformes que es mouen i desapareixen, bolets saltadors, pedres que s'esfondren, corrents d'aire, bigues que giren, trampolins i salts planant; punts de control i rècord de temps per nivell
- **Arena per equips**, **Tots contra tots** i **Rei del turó** (multijugador)

Multijugador amb **codi de sala**: crees una sala privada, els amics hi entren escrivint el codi de 4 números
(o amb l'enllaç `?sala=CODI`), xategeu,
i el líder (👑) tria el mode i comença. En acabar, tothom torna a la sala per jugar un altre mode.
Funciona amb el servidor de Render (`server.js`) o directament dins de Claude: allà el navegador del
líder fa de servidor i els missatges van per les sales en directe de l'artifact (`public/js/p2p.js`).

- 4 classes: Mag de Foc, Mag de Gel i Mag del Llamp (raigs, orbes que giren, vòrtexs que xuclen, camps de foc…) i el Guerrer, només cos a cos (combos, cop demolidor, ràfega de talls) amb una Forma Titànica que multiplica ×1,5 totes les seves estadístiques
- 3 branques d'habilitats per classe (Grimori, tecla K): 1 punt per nivell, files que s'obren amb el nivell, una habilitat nova per branca i una millora definitiva
- Estadístiques (tecla C): punts per pujar i punts pujats a la vista; el poder fa més fortes totes les habilitats (el dany mostrat ja l'inclou)
- Grimori (tecla K): runes per personalitzar cada habilitat, encanteris propis guardats i fins a 4 conjunts desats per canviar de configuració
- Història en 5 capítols amb guia a la pantalla (brúixola, marcador i columna de llum), recompenses del Capità Bru, botiga, aparences i portals
- Fortaleses amb murs i torres (Fortí dels Puglins, Ciutadella del Sol, Cripta del Rei Ossut, Fort de Malfoc): onades d'enemics fins al cap del fons i un cofre amb recompensa
- Monstres nous: gòlems de runa i de magma, esquelets arquers i piromants, bruixots, Ganfaul i el drac Ignàrion
- Món obert: vila, bosc, ruïnes, terres cremades, costa i illes flotants al cel (s'hi arriba amb la Pedra de Vent i planant)
- Combat d'acció: combos elementals, esquivar amb invulnerabilitat, bloquejar, fixar objectiu, caps finals amb fases
- Cicle de dia i nit, música generativa i efectes de so sintetitzats

## Controls

| Tecla | Acció |
|---|---|
| WASD | Moure's |
| Ratolí | Girar la càmera (clica la pantalla per capturar el ratolí) |
| Clic esquerre | Atac bàsic |
| Clic dret | Bloquejar |
| 1 2 3 4 | Habilitats (les de zona: mantén premut per apuntar i deixa anar) |
| R | Transformació (quan l'aura és plena) |
| Espai | Saltar, doble salt; mantén-lo a l'aire per planar |
| Maj | Esprintar |
| Q | Esquivar (rodar) |
| F | Parlar, obrir cofres, portals; mantén-la per reviure un company |
| Tab | Fixar objectiu |
| G / H | Poció de vida / de manà |
| I / C / M | Inventari / Personatge i talents / Mapa |
| K | Grimori: branques d'habilitats, runes, encanteris propis i conjunts |
| Retorn | Xat |
| T | Ball |
| Esc | Menú |

## Executar-lo al teu ordinador

Cal [Node.js](https://nodejs.org) 18 o més nou.

```bash
npm install --omit=dev
npm start
```

Obre http://localhost:3000 al navegador.

## Publicar-lo a Render (gratuït) per jugar amb amics

Mira el fitxer [DESPLEGAR.md](DESPLEGAR.md): hi ha els passos detallats.

## Estructura

```
server.js              servidor (Express + Socket.IO, sales de fins a 4 jugadors)
public/index.html      interfície
public/js/sim.js       simulació del joc (la fan servir el servidor i el mode un jugador)
public/js/data.js      classes, habilitats, enemics, objectes i història
public/js/worldgen.js  generació del món (compartida client/servidor)
public/js/*.js         client: gràfics, personatges, controls, efectes, so, menús
public/assets/         models 3D, animacions i textures
public/vendor/         three.js i three-vrm
```

## Crèdits dels recursos

- Herois: models VRM fets amb VRoid Studio
- Monstres i natura: Quaternius (CC0)
- Vila, ruïnes, armes, esquelets i personatges no jugables: KayKit de Kay Lousberg (CC0)
- Cases modulars i fortaleses: Medieval Village MegaKit de Quaternius (CC0)
- Drac: «Dragon» de Bernardo Ferreira Baptista — CC BY 4.0 (Sketchfab)
- Gòlems: «Golem Rigged» de FourthGreen — CC BY 4.0 (Sketchfab)
- Esquelets guerrers i piromants: «D&D Heroes (2003) – Skeleton» de Ziggertron — CC BY 4.0 (Sketchfab)
- Ganfaul i bruixots: personatge de Mixamo (Adobe)
- Animacions: Universal Animation Library de Quaternius (CC0) i Mixamo (Adobe)
- Motor: three.js (MIT) i @pixiv/three-vrm (MIT)
