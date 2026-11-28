variable "region" {
  type    = string
  default = "eu-west-3"
}
variable "instance_type" {
  type    = string
  default = "t3.small"
}
variable "public_key" {
  type        = string
  description = "Clé publique SSH autorisée sur la VM"
}

variable "ssh_allowed_cidr" {
  type        = string
  description = "CIDR de sortie autorisé à se connecter en SSH, par exemple Jenkins"

  validation {
    condition     = can(cidrhost(var.ssh_allowed_cidr, 0))
    error_message = "ssh_allowed_cidr doit être un CIDR valide."
  }
}
