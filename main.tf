## creates vpc
resource "aws_vpc" "my-vpc" {
  cidr_block="10.0.0.0/16"
  tags={
    Name="my-vpc"
  }
 ##Creates 2 public subnets 
}
resource "aws_subnet" "public1" {
  vpc_id= aws_vpc.my-vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags={
    Name="public1"
  }
}
resource "aws_subnet" "public2" {
  
  vpc_id = aws_vpc.my-vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-1b"
  tags = {Name="public2"}
}
resource "aws_subnet" "private1" {
  vpc_id            = aws_vpc.my-vpc.id
  cidr_block        = "10.0.3.0/24" 
  availability_zone = "us-east-1c" 

  tags = {
    Name = "private_subnet"
  }
}
##Creates route table 
resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.my-vpc.id

  tags = {
    Name = "private_route_table"
  }
}
resource "aws_route_table_association" "private_route_table_association" {
  subnet_id      = aws_subnet.private1.id
  route_table_id = aws_route_table.private_route_table.id
}
##Creates internet gateway
resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public1.id
}
#creates eip
resource "aws_eip" "nat_eip" {
  vpc = true
}
##Defines ASG
resource "aws_launch_template" "asg_launch_template" {
  name_prefix   = "asg-launch-template"
  image_id      = var.ami
  instance_type = var.ec2_instance_type

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.terraformSG.id]
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    sudo apt update -y
    sudo apt install apache2 -y
    sudo systemctl start apache2
    sudo bash -c 'echo your every first web server > /var/www/html/index.html'
    EOF
  )
}
##Associates gateway route
resource "aws_route" "private_nat_gateway_route" {
  route_table_id         = aws_route_table.private_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat_gateway.id
}
resource "aws_internet_gateway" "my-igw" {
  vpc_id= aws_vpc.my-vpc.id

}
resource "aws_route_table" "my-table" {
  vpc_id=aws_vpc.my-vpc.id
  route {
    cidr_block= "0.0.0.0/0"
    gateway_id = aws_internet_gateway.my-igw.id
  }
  route{
    ipv6_cidr_block="::/0"
    gateway_id = aws_internet_gateway.my-igw.id
  }
}
resource "aws_route_table_association" "route" {
  subnet_id = aws_subnet.public1.id
  route_table_id = aws_route_table.my-table.id
}

##Defines Sec groups
resource "aws_security_group" "terraformSG" {
  name="allowweb"
  vpc_id = aws_vpc.my-vpc.id
  ingress{
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  
  }
    ingress{
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  
  }
    ingress{
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_network_interface" "my-interface" {
  subnet_id = aws_subnet.public1.id
  private_ips = ["10.0.1.50"]
  security_groups =[aws_security_group.terraformSG.id]
}
# resource "aws_eip" "elasticip" {
#   vpc=true
#   network_interface = aws_network_interface.my-interface.id
#   associate_with_private_ip = "10.0.1.50"
  
# }
resource "aws_instance" "ec2" {
  
    ami=var.ami
    instance_type= var.ec2_instance_type
    availability_zone = "us-east-1a"
    
    tags={
    name="my-ec2" }
    key_name = "levilab"

    network_interface {
      device_index = 0
      network_interface_id = aws_network_interface.my-interface.id

    }
   user_data = base64encode(<<-EOF
        #!/bin/bash
        sudo apt update -y
        sudo install apache2 -y
        sudo systemctl start apache2
        sudo bash -c 'echo your every first web server > /var/www/html/index.html
        EOF
        )
     
}
resource "aws_instance" "ec2-2" {
    ami= var.ami
    instance_type= var.ec2_instance_type
    availability_zone = "us-east-1b"
    tags={
    name="my-ec2" }
    key_name = "levilab"

    network_interface {
      device_index = 0
      network_interface_id = aws_network_interface.my-interface.id

    }
    
   user_data =base64encode( <<-EOF
        #!/bin/bash
        sudo apt update -y
        sudo install apache2 -y
        sudo systemctl start apache2
        sudo bash -c 'echo your every first web server > /var/www/html/index.html
        EOF
   )
}

resource "aws_elb" "elb" {
  name="elb-terraform"
  availability_zones = ["us-east-1a","us-east-1b"]
  listener {
    instance_port = 8000
    instance_protocol = "http"
    lb_port = 80
    lb_protocol = "http"
  }
 instances = [aws_instance.ec2.id,aws_instance.ec2-2.id]
 cross_zone_load_balancing = true
 idle_timeout = 400
 connection_draining = true
 connection_draining_timeout = 400
  
}
resource "aws_lb_target_group" "example" {
  name     = "example-target-group"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = aws_vpc.my-vpc.id
}
resource "aws_autoscaling_group" "example" {
  name                      = "example-asg"
  max_size                  = 5
  min_size                  = 2
  desired_capacity          = 2
  health_check_grace_period = 300
  health_check_type         = "ELB"
  target_group_arns         = [aws_lb_target_group.example.arn]
  vpc_zone_identifier       = [aws_subnet.public1.id, aws_subnet.public2.id]

  launch_template {
    id      = aws_launch_template.asg_launch_template.id
    version = "$Latest"
  }
}
resource "aws_db_instance" "mysql_db" {
  identifier             = "mysql-db"
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "mysql"
  engine_version         = "5.7"
  instance_class         = "db.t3.micro" 
  username               = "root"
  password               = "your_password"
  db_subnet_group_name   = aws_db_subnet_group.private_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_security_group.id]
  skip_final_snapshot    = true
}
resource "aws_db_subnet_group" "private_subnet_group" {
  name       = "private-subnet-group"
  subnet_ids = [aws_subnet.private1.id]

  tags = {
    Name = "Private Subnet Group"
  }
}
resource "aws_security_group" "db_security_group" {
  name        = "db-security-group"
  description = "Security group for MySQL database"
  vpc_id      = aws_vpc.my-vpc.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.public1.cidr_block, aws_subnet.public2.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}