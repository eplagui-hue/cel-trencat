# Com publicar Cel Trencat a internet (GitHub + Render, gratis)

> **També podeu jugar junts sense Render**, directament a la versió del joc que hi ha a Claude:
> obre el joc → **Multijugador** → **Crear sala** i passa el codi als amics. El joc de qui crea la sala
> fa de servidor, així que ha de tenir la pestanya oberta i visible mentre jugueu. Els teus amics
> necessiten un compte de Claude i que els comparteixis el joc (botó **Compartir** de l'artifact).
> Render només cal si vols una adreça pròpia que funcioni sense Claude.

Quan acabis tindràs una adreça com `https://cel-trencat.onrender.com` que pots passar als teus amics
per jugar junts (fins a 4 per sala).

## Pas 1: Puja el joc a GitHub

1. Descomprimeix `cel-trencat.zip` al teu ordinador.
2. Entra a https://github.com i inicia sessió.
3. Clica el botó verd **New** (o el **+** de dalt a la dreta → **New repository**).
4. Posa-li de nom `cel-trencat`, deixa'l **Public** i clica **Create repository**.
5. A la pàgina nova, clica l'enllaç **uploading an existing file**.
6. Obre la carpeta `cel-trencat` que has descomprimit, selecciona **tot el que hi ha a dins**
   (`public`, `server.js`, `package.json`, etc.) i arrossega-ho a la finestra de GitHub.
   Important: arrossega el contingut, no la carpeta sencera, perquè `package.json` quedi a l'arrel.
7. Espera que acabi de pujar tots els fitxers i clica **Commit changes**.

## Pas 2: Crea el servidor a Render

1. Entra a https://render.com i inicia sessió amb el teu compte de GitHub.
2. Clica **+ New** → **Web Service**.
3. Tria el repositori `cel-trencat` (si no surt, clica **Configure account** i dona-li permís).
4. Omple-ho així:
   - **Name**: `cel-trencat` (serà part de l'adreça)
   - **Language / Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install --omit=dev`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Clica **Deploy Web Service** i espera uns minuts fins que surti **Live**.
6. L'adreça del joc surt a dalt de tot (per exemple `https://cel-trencat.onrender.com`).

## Pas 3: Juga amb els amics

1. Obre l'adreça de Render al navegador (Chrome o Edge van millor).
2. Tria **Multijugador** → **Crear sala** i després tria o crea el teu heroi. Entraràs a la
   **sala**: a dalt hi ha el **codi de sala** de 4 números. Passa'l als amics (botó **Copiar codi**)
   o envia'ls l'enllaç directe (botó **Copiar enllaç**, que ja porta el codi).
3. Els teus amics obren la mateixa adreça, trien **Multijugador**, escriuen el codi a la casella
   **Entrar amb codi** i premen **Entrar a la sala** (o Enter). Si el codi no existeix o la sala és
   plena, els ho diu abans de triar l'heroi. Les sales són privades: no surten en cap llista, només
   s'hi pot entrar amb el codi. Tothom apareix a la llista de jugadors i podeu parlar pel xat.
4. Qui ha creat la sala és el **líder** (👑). El líder tria el mode (Mode història, Hordes,
   Cacera de caps, Contrarellotge, Arena per equips, Tots contra tots o Rei del turó) i prem
   **Començar**. Els modes PvP necessiten com a mínim 2 jugadors.
5. Quan s'acaba una partida, cliqueu **Tornar a la sala** (o al menú Esc). El líder pot prémer
   **Acabar per a tothom** per tornar tots junts a la sala i triar un altre mode.
   Si algú arriba quan la partida ja ha començat, pot clicar **Entrar a la partida**.
   Si el líder marxa, el següent jugador de la sala passa a ser el líder.

## Coses a saber

- **El pla gratuït de Render s'adorm** si ningú hi entra durant 15 minuts. La primera persona que hi
  entri haurà d'esperar fins a un minut que es desperti. És normal.
- **Les partides es desen al teu navegador.** El servidor també en guarda una còpia, però al pla
  gratuït s'esborra quan Render el reinicia, així que juga sempre des del mateix navegador.
- **Per actualitzar el joc**, puja els fitxers nous al repositori de GitHub (mira l'apartat següent):
  Render el tornarà a publicar sol.
- Si el joc va lent, a **Opcions** posa la qualitat a **Baixa**.

## Actualitzar el joc (quan et passo una versió nova)

1. Descomprimeix el `cel-trencat.zip` nou.
2. Ves al teu repositori `cel-trencat` de GitHub → **Add file** → **Upload files**.
3. Obre la carpeta `cel-trencat` descomprimida, selecciona **tot el que hi ha a dins** (`public`,
   `server.js`, `package.json`…) i arrossega-ho a GitHub. Els fitxers amb el mateix nom se
   substitueixen sols. Espera que acabi de pujar-ho tot i clica **Commit changes**.
4. A https://dashboard.render.com obre el servei `cel-trencat`. A **Events** ha de sortir un
   desplegament nou; espera que posi **Live** (2-5 minuts). Si no n'ha sortit cap, clica
   **Manual Deploy** → **Deploy latest commit**.
5. Obre l'adreça del joc i recarrega la pàgina (**Ctrl + F5**).

**Com saber si tens la versió nova:** a la pantalla d'inici, a baix a la dreta, surt el número de
versió (ara mateix, **v1.8**). A més, si el joc és nou però el servidor de Render encara és l'antic,
a la pantalla de **Multijugador** surt un avís ⚠️ que t'ho diu.

