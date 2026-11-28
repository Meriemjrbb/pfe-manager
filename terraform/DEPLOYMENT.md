# Déploiement local avec VirtualBox

## Prérequis

La machine qui exécute Terraform et l'agent Jenkins doit avoir :

- VirtualBox et `VBoxManage` accessibles dans le `PATH` ;
- Vagrant ;
- Terraform 1.4 ou plus récent ;
- Docker avec Docker Compose v2 ;
- Python 3 pour exécuter les tests backend.

Jenkins doit s'exécuter sur l'hôte VirtualBox, ou sur un agent qui peut utiliser VirtualBox et joindre son réseau host-only. Pour l'agent Windows, ajouter les répertoires de VirtualBox, Vagrant et Docker au `PATH` du compte qui exécute le service Jenkins, puis redémarrer ce service.

## Réseau et VM

Terraform utilise Vagrant avec le provider VirtualBox. La box Ubuntu `ubuntu/noble64` reçoit :

- 2 processeurs virtuels ;
- 4096 Mo de mémoire ;
- une interface NAT pour l'accès sortant ;
- une interface host-only à l'adresse fixe `192.168.56.10`.

L'adresse doit être libre et appartenir au réseau host-only configuré dans VirtualBox. Depuis l'hôte, l'application est accessible à `http://192.168.56.10`. L'adresse n'est pas exposée sur le réseau public.

Vagrant installe Docker et Compose v2 au premier démarrage. Le compte SSH invité est `vagrant`; la clé publique Terraform est ajoutée à ses clés autorisées.

## Lancement manuel

Depuis la racine du dépôt, initialiser et valider Terraform :

```bash
terraform -chdir=terraform init
terraform -chdir=terraform validate
```

Appliquer la configuration avec une clé publique OpenSSH :

```bash
terraform -chdir=terraform apply -var="public_key=ssh-ed25519 AAAA... commentaire"
```

Vérifier l'adresse et l'utilisateur SSH :

```bash
terraform -chdir=terraform output -raw public_ip
terraform -chdir=terraform output -raw ssh_user
```

Pour supprimer la VM créée par cette configuration :

```bash
terraform -chdir=terraform destroy -var="public_key=ssh-ed25519 AAAA... commentaire"
```

Ne pas versionner la clé privée, les fichiers d'état Terraform ou le répertoire Vagrant local.

## Jenkins

L'agent doit conserver son workspace entre les exécutions : Terraform garde son état local sous `terraform/` et Vagrant garde l'identifiant de la VM dans `terraform/.vagrant/`. Ne pas nettoyer ces fichiers entre un provisionnement et un déploiement.

Créer les credentials Jenkins suivants :

| ID | Type Jenkins | Utilisation |
| --- | --- | --- |
| `vm-ssh-public-key` | Secret text | Clé publique OpenSSH correspondant à la clé privée de déploiement |
| `vm-ssh-key` | SSH Username with private key | Clé privée utilisée pour joindre la VM ; le pipeline récupère l'utilisateur `vagrant` depuis Terraform |
| `llm-api-key` | Secret text | Clé LLM injectée dans l'environnement de l'application |
| `db-password` | Secret text | Mot de passe PostgreSQL injecté dans l'environnement de l'application |

Dans le job multibranche, les étapes de provisionnement et de déploiement sont désactivées par défaut et ne s'exécutent que sur `main` :

1. Activer `PROVISION_VM` pour créer ou mettre à jour la VM.
2. Activer `DEPLOY` pour transférer le projet par SSH et démarrer les services avec `docker compose`.
3. Pour le premier déploiement, activer les deux paramètres dans le même lancement. Pour un déploiement ultérieur, `DEPLOY` suffit si l'état Terraform et le workspace ont été conservés.

Le pipeline utilise `terraform output -raw public_ip` et `terraform output -raw ssh_user` pour se connecter. Il exclut les fichiers `.env`, l'état Terraform et les répertoires locaux de l'archive transférée. Le fichier temporaire `.env.prod` est supprimé à la fin du pipeline.
