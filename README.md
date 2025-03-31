# youlend-k8s

### Deployment 

**EKS**
* Cluster Features
  * **ELK** Stack for log insights
  * Application deployed via **Helm**
  * **Kube Prometheus** stack for metrics
  * Audit log sent to **Cloudwatch**
  * Optional RBAC configuration
  * mTLS & Ingress controllers via **Istio**
* Security Features
  * Self-signed cert for external load balancer
  * **Istio** mTLS
  * Network Policies
  * Seccomp Profiles
  * Security Context
  * Kubernetes Secrets used where possible

**Application Notes**

* Admin role can be set on registering an account for convenience - Not suitable for production.
* Only admins can delete loans
* Features
  * JWT 
  * Rate Limiting
  * Input validation via JOI

### Extra Notes

* I used a self-signed certificate to provide the external load balancer TLS for the purpose of this project. In a production setting I would create a domain name & attain a certificate from a trusted source like ACM or LetsEncrypt. 
* Currently accessing internal resources (Grafana & Kibana) via port-forwarding. In production I’d set-up a VPN via AWS Client VPN.
* Couldn’t set the elasticsearch credentials via Kubernetes Secrets. Unsure why, but ideally I would fetch via secrets manager or other secure storage. 
* Using local state management for the purpose of this project for ease of replication. Ideally I’d use S3 + Dynamo for state but that requires creating a bucket beforehand. Because of this I couldn’t add a deploy stage to my pipeline as it would recreate AWS resources. Similarly, I couldnt employ proper tagging methods as I would be editing the tfvars file to update config with new image tags.
* I tried to implement storage persistence using the EBS add-on for EKS but the PVC wouldn’t bind due to mismatched tagging (I think, yet to figure this one out).
* Had trouble applying mTLS to services other than my application. For now I’ve set it to `PERMISSIVE` to allow non istio-injected pods to communicate with my application. Not suitable for production however.

--- 

### Steps to run:

*Ensure you have AWS CLI installed & you’re signed in.*
1. Fork this repo.
2. Navigate to the project folder & run the following:
    1. `cd terraform`
    2. `terraform init`
    3. `terraform apply --auto-approve`
3. Once everything is up run `aws eks update-kubeconfig --region eu-west-2 --name youlend-k8s`.
4. To access the application.
  1. Run `kubectl get svc -n istio-system external-istio-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'`
  2. Paste the address in your browser.
5. To access the internal components (Grafana & Kibana).
  1. Run `kubectl port-forward svc/internal-istio-ingress -n istio-system 8080:80`
  2. Go to localhost:8080/grafana or /kibana.
  3. For Grafana 
        1. **username**: admin | **password**: Run  `kubectl get secret grafana-credentials -n monitoring -o jsonpath='{.data.admin-password}' | base64 --decode`
  4. For Kibana: 
        1. **username**: elastic | **password**: password