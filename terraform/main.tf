terraform {
  required_version = ">= 1.4.0"
}

resource "terraform_data" "virtualbox_vm" {
  triggers_replace = {
    ubuntu_box = var.ubuntu_box
    cpu_count  = var.cpu_count
    memory_mb  = var.memory_mb
    vm_ip      = var.vm_ip
    public_key = var.public_key
  }

  provisioner "local-exec" {
    command     = "vagrant up --provider=virtualbox"
    working_dir = path.module

    environment = {
      PFE_VM_BOX            = var.ubuntu_box
      PFE_VM_CPUS           = tostring(var.cpu_count)
      PFE_VM_MEMORY_MB      = tostring(var.memory_mb)
      PFE_VM_IP             = var.vm_ip
      PFE_VM_SSH_PUBLIC_KEY = var.public_key
    }
  }

  provisioner "local-exec" {
    when        = destroy
    command     = "vagrant destroy --force"
    working_dir = path.module
  }
}
