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
