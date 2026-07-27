package com.serviceflow.backend;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class CustomerController{
    @GetMapping("/api/customers")
    public List<String> getCustomers() {
        return List.of("Maria Garcia", "James Chen", "Aisha Patel");
    }
    

}
