#Valgte javascript, css og html. Dette er fordi jeg har mest kunnskap til de og derfor kan gjøre det enklere å forstå og lage prosjektet.

#Notat App 

En enkel notatapplikasjon med database (SQL) for å lagre og håndtere notater.

---

##Funksjoner

- Opprette nye notater
- Lese eksisterende notater
- Oppdatere notater
- Slette notater
- Lagring i SQL-database

---

##Installasjon

```bash
git clone git@github.com:jahaa032/notat_app.git
cd notat_app
```

---

##SSH-oppsett (GitHub)

For å lage SSH-nøkler (må gjøres på hver PC som skal kommunisere med GitHub):

```bash
ssh-keygen -t ed25519 -C "github@mailen.din"
```

Du vil få spørsmål om passphrase. Dette er valgfritt.

Dette lager to nøkler:

- **Private:** `id_ed25519`
- **Public:** `id_ed25519.pub`

**ALDRI GI FRA DEG PRIVATE KEY**

Les public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

---

###Legg til SSH-nøkkel på GitHub

1. Trykk profilbildet ditt (øverst til høyre)
2. Gå til **Settings**
3. Velg **SSH and GPG keys**
4. Trykk **New SSH key**
5. Gi den et navn (f.eks. "Skole PC")
6. Velg **Authentication Key**
7. Lim inn public key
8. Trykk **Add SSH key**

---

###Test SSH-tilkobling

```bash
ssh -T git@github.com
```

Skriv `yes` første gang.

---

###Sjekk om repo bruker HTTPS eller SSH

```bash
git remote -v
```

- HTTPS:

```
origin https://github.com/brukernavn/prosjekt.git
```

- SSH:

```
origin git@github.com:brukernavn/prosjekt.git
```

Endre til SSH hvis nødvendig:

```bash
git remote set-url origin git@github.com:brukernavn/prosjekt.git
```

---

Etter dette slipper du brukernavn og passord ved push/pull.

---

##Database

```bash
mysql -u brukernavn -p database_navn < database.sql
```

eller

```bash
psql -U brukernavn -d database_navn -f database.sql
```

---

##Git-kommandoer

###Sett brukernavn og e-post:

```bash
git config --global user.name "Navn"
git config --global user.email "github@mailen.din"
```

###Klone repo:

```bash
git clone git@github.com:brukernavn/repo.git
```

###Opprette nytt repo:

```bash
git init
```

###Status:

```bash
git status
```

###Legge til filer:

```bash
git add fil.txt
git add .
```

###Commit:

```bash
git commit -m "Melding"
```

###Koble til remote:

```bash
git remote add origin git@github.com:bruker/repo.git
```

###Push:

```bash
git push -u origin main
```

###Pull:

```bash
git pull origin main
```

###Fetch:

```bash
git fetch origin
```

---


