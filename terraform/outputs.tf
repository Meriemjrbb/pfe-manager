output "public_ip" {
  description = "Adresse host-only fixe de la VM VirtualBox"
  value       = var.vm_ip
  depends_on  = [terraform_data.virtualbox_vm]
}

output "ssh_user" {
  description = "Compte SSH Ubuntu de la box Vagrant"
  value       = "vagrant"
}
