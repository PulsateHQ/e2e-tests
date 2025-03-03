export enum WebSdkStatisticsAction {
  CARD_FRONT_IMPRESSION = 'card_front_impression',
  CARD_FRONT_BUTTON_CLICK_ONE = 'card_front_button_click_one',
  CARD_FRONT_BUTTON_CLICK_TWO = 'card_front_button_click_two',
  CARD_BACK_IMPRESSION = 'card_back_impression',
  CARD_BACK_BUTTON_CLICK_ONE = 'card_back_button_click_one',
  CARD_BACK_BUTTON_CLICK_TWO = 'card_back_button_click_two'
}

export interface WebSdkStatisticsPayload {
  alias: string;
  campaignGuid: string;
  key: WebSdkStatisticsAction;
}
