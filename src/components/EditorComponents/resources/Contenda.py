from requests import request

def work():
    frontend = "did frontend work in react"
    backend = "python + flask, AWS Lambda, EC2 and S3"
    return frontend + " " + backend

def time():
    start = "aug 2021"
    end = "oct 2021"
    return start + " " + end

def location():
    return "philly"