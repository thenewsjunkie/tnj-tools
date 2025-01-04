export interface DatabaseEnums {
  call_status: "waiting" | "connected" | "ended"
  review_type: "television" | "movie" | "food" | "product"
  lower_third_type: "news" | "guest" | "topic" | "breaking"
  employment_status:
    | "full_time"
    | "part_time"
    | "self_employed"
    | "unemployed"
    | "student"
    | "retired"
  income_bracket:
    | "under_25k"
    | "25k_50k"
    | "50k_75k"
    | "75k_100k"
    | "100k_150k"
    | "over_150k"
  marital_status:
    | "single"
    | "married"
    | "divorced"
    | "widowed"
    | "separated"
    | "domestic_partnership"
}