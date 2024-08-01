variable "region" {
  description = "aws deploy region"
  type= string
  default = "us-east-1"
  
}
variable "ec2_instance_type" {
  type=string
}
variable "ami" {
    type=string
    default="ami-0b72821e2f351e396"
  
}
