variable "cpu_count" {
  type        = number
  description = "Nombre de processeurs virtuels de la VM"
  default     = 2

  validation {
    condition     = var.cpu_count >= 1 && var.cpu_count <= 64
    error_message = "cpu_count doit être compris entre 1 et 64."
  }
}

variable "memory_mb" {
  type        = number
  description = "Mémoire de la VM en mégaoctets"
  default     = 4096

  validation {
    condition     = var.memory_mb >= 1024
    error_message = "memory_mb doit être au moins égal à 1024."
  }
}

variable "ubuntu_box" {
  type        = string
  description = "Box Vagrant Ubuntu utilisée par VirtualBox"
  default     = "ubuntu/noble64"

  validation {
    condition     = length(trimspace(var.ubuntu_box)) > 0
    error_message = "ubuntu_box ne peut pas être vide."
  }
}

variable "vm_ip" {
  type        = string
  description = "Adresse IPv4 fixe de l'interface host-only de la VM"
  default     = "192.168.56.10"

  validation {
    condition     = can(cidrhost("${var.vm_ip}/32", 0))
    error_message = "vm_ip doit être une adresse IPv4 valide."
  }
}

variable "public_key" {
  type        = string
  description = "Clé publique SSH autorisée pour le compte vagrant"

  validation {
    condition     = can(regex("^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp(256|384|521)) [A-Za-z0-9+/=]+( .*)?$", trimspace(var.public_key)))
    error_message = "public_key doit contenir une clé publique OpenSSH valide."
  }
}
