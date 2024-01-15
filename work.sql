CASE
    WHEN coffee_usage = 'zero' then coffee_no_buyer
    WHEN coffee_usage = 'light' then coffee_light_buyer
    WHEN coffee_usage = 'medium' AND business_mode = 'B2C' then coffee_medium_buyer_b2c
    WHEN coffee_usage = 'medium' AND business_mode = 'B2B2C' then coffee_medium_buyer_b2b2c
END AS PromotionMember_ID