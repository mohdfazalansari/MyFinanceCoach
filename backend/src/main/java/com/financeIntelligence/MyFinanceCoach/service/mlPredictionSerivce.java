package com.financeIntelligence.MyFinanceCoach.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;



import com.financeIntelligence.MyFinanceCoach.dto.mlRequestDto;
import com.financeIntelligence.MyFinanceCoach.dto.mlResponseDto;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class mlPredictionSerivce {
  private final RestTemplate restTemplate;

  private final String mlServiceUrl = "http://localhost:8000/api/predict-category";

  public mlPredictionSerivce(){
    this.restTemplate = new RestTemplate();
  }

  public String predictCategory(String description, String merchant, BigDecimal amount){
    try {
      String safeDescription = (description != null) ? description : "";
      String safeMerchant   = (merchant != null)     ? merchant   : "";
 
      // If both are blank there's nothing to classify — skip the network call
            if (safeDescription.isBlank() && safeMerchant.isBlank()) {
                log.warn("Both description and merchant are blank — skipping ML call");
                return "Uncategorized";
            }

      //prepare payload to sent to the python
      mlRequestDto request =  new mlRequestDto(description, merchant, amount);

      //make post request to the python api
      mlResponseDto response = restTemplate.postForObject(
        mlServiceUrl,
        request,
        mlResponseDto.class
      );

      //retrun the predicted category
      if(response != null && response.getCategory() != null){
        log.info("ML Engine predicted category: {} for description: {}", response.getCategory(), description);
        return response.getCategory();
      }
    } catch (Exception e) {
      log.error("Failed to connect to Python ML Service. Defaulting to UnCategorized Errror: {}", e.getMessage());
    }
    return "Uncategorized";
  }

}
