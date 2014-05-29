<?php

class AfterClassEventPickerField extends DropdownField {
	private $feedBase = 'http://afterclass.uiowa.edu/events/';
	//private $feedBase = 'http://baltar.imu.uiowa.edu:8888/after-class';

	private static $default_category = 0;

	protected $extraClasses = array('dropdown');


	public function __construct($name, $title = null, $source = null, $value = "", $form=null, $category = 0) {

		$eventsPage = AfterClassEventsPage::get()->First();

		if($eventsPage){
			$feedURL = $this->feedBase."categories/".$eventsPage->DisplayCategory.'/feed/json';
		}else{
			$feedURL = $this->feedBase."feed/json";
		}		

		$rawFeed = file_get_contents($feedURL);
		$eventsArray = json_decode($rawFeed, TRUE);

		if(!empty($eventsArray)){
			foreach($eventsArray['events'] as $key => $event){
				$source[$event['id']] = $event['name'];
			}
		}

		parent::__construct($name, ($title===null) ? $name : $title, $source, $value, $form);
		$this->setEmptyString('(No Event)');
	}

	public function Field($properties = array()) {
		return parent::Field();
	}
}
