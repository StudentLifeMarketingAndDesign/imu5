<?php
class BuildingDepartment extends Page {

	private static $db = array(
		'Location' => 'Varchar(155)',
		'Phone' => 'Varchar(55)',
		'MonOpenTime' => 'Time',
		'MonCloseTime' => 'Time',
		'MonOpenAllDay' => 'Boolean',
		'MonClosedAllDay' => 'Boolean',

		'TueOpenTime' => 'Time',
		'TueCloseTime' => 'Time',
		'TueOpenAllDay' => 'Boolean',
		'TueClosedAllDay' => 'Boolean',

		'WedOpenTime' => 'Time',
		'WedCloseTime' => 'Time',
		'WedOpenAllDay' => 'Boolean',
		'WedClosedAllDay' => 'Boolean',

		'ThuOpenTime' => 'Time',
		'ThuCloseTime' => 'Time',
		'ThuOpenAllDay' => 'Boolean',
		'ThuClosedAllDay' => 'Boolean',

		'FriOpenTime' => 'Time',
		'FriCloseTime' => 'Time',
		'FriOpenAllDay' => 'Boolean',
		'FriClosedAllDay' => 'Boolean',

		'SatOpenTime' => 'Time',
		'SatCloseTime' => 'Time',
		'SatOpenAllDay' => 'Boolean',
		'SatClosedAllDay' => 'Boolean',

		'SunOpenTime' => 'Time',
		'SunCloseTime' => 'Time',
		'SunOpenAllDay' => 'Boolean',
		'SunClosedAllDay' => 'Boolean',

		'Exceptions' => 'Text'
	);

	private static $has_one = array(

	);

	private static $summary_fields = array(
		'Title',
		'Location',
		'HoursDateRange',
		'RegularHours',
		'ExceptionHours'
	);


	public function TodayOpenTime(){
		$currentDay = date('D');
		return $this->obj($currentDay.'OpenTime');
	}
	public function TodayCloseTime(){
		$currentDay = date('D');
		return $this->obj($currentDay.'CloseTime');
	}

	public function TodayOpenAllDay(){
		$currentDay = date('D');
		return $this->obj($currentDay.'OpenAllDay');
	}

	public function TodayClosedAllDay(){
		$currentDay = date('D');
		return $this->obj($currentDay.'ClosedAllDay');		
	}

	public function Days(){
		$days = new ArrayList();

		for($i=1;$i<=7;$i++){
			$j = $i - 1;
		    $date = new DateTime(); //<-- Grabs today's datetime
		    $date->add(new DateInterval('P'.$j.'D')); //<--- Passes the current value of $i to add days..
		    $day = DataObject::create();

		    $day->Day = $date->format('l');
		    $day->DayShort = $date->format('D');
		    $dayShort =$date->format('D');

		    $day->OpenTime = new Time();
		    $day->CloseTime = new Time();
		    $day->OpenAllDay = new Boolean();
		    $day->ClosedAllDay = new Boolean();

		    $day->OpenTime->setValue($this->obj($dayShort.'OpenTime')->getValue());
		    $day->CloseTime->setValue($this->obj($dayShort.'CloseTime')->getValue());
		    $day->OpenAllDay->setValue($this->obj($dayShort.'OpenAllDay')->getValue());
		    $day->ClosedAllDay->setValue($this->obj($dayShort.'ClosedAllDay')->getValue());
		    // print_r($day);
		    $days->push($day);
		}
	
		return $days;
	}

	public function getCMSFields() {
		$fields = parent::getCMSFields();
		$fields->removeByName('Content');
		$fields->removeByName('SortOrder');
		$fields->removeByName('LayoutType');
		$fields->removeByName('BackgroundImage');

		$fields->addFieldToTab('Root.Main', TextField::create('Location'));
		$fields->addFieldToTab('Root.Main', TextField::create('Phone'));

		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("MonOpenTime","Open"),
		        TimeField::create("MonCloseTime","Closed"),
		        CheckboxField::create('MonOpenAllDay', 'Open 24 hours?'),
		        CheckboxField::create('MonClosedAllDay', 'Closed all day?')
		    )->setTitle('Monday')
		);

		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("TueOpenTime","Open"),
		        TimeField::create("TueCloseTime","Closed"),
		        CheckboxField::create('TueOpenAllDay', 'Open 24 hours?'),
		        CheckboxField::create('TueClosedAllDay', 'Closed all day?')
		    )->setTitle('Tuesday')
		);

		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("WedOpenTime","Open"),
		        TimeField::create("WedCloseTime","Closed"),
		        CheckboxField::create('WedOpenAllDay', 'Open 24 hours?'),
		        CheckboxField::create('WedClosedAllDay', 'Closed all day?')
		    )->setTitle('Wednesday')
		);

		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("ThuOpenTime","Open"),
		        TimeField::create("ThuCloseTime","Closed"),
		        CheckboxField::create('ThursOpenAllDay', 'Open 24 hours?'),
		        CheckboxField::create('ThursClosedAllDay', 'Closed all day?')
		    )->setTitle('Thursday')
		);
		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("FriOpenTime","Open"),
		        TimeField::create("FriCloseTime","Closed"),
		        CheckboxField::create('FriOpenAllDay', 'Open 24 hours?'),
		        CheckboxField::create('FriClosedAllDay', 'Closed all day?')
		    )->setTitle('Friday')
		);
		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("SatOpenTime","Open"),
		        TimeField::create("SatCloseTime","Closed"),
		        CheckboxField::create('SatOpenAllDay', 'Open 24 hours?'),
		        CheckboxField::create('SatClosedAllDay', 'Closed all day?')
		    )->setTitle('Saturday')
		);
		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("SunOpenTime","Open"),
		        TimeField::create("SunCloseTime","Closed"),
		        CheckboxField::create('SunOpenAllDay', 'Open 24 hours?'),
		        CheckboxField::create('SunClosedAllDay', 'Closed all day?')
		    )->setTitle('Sunday')
		);

		$fields->addFieldToTab('Root.Main', new TextareaField('Exceptions', 'Exceptions'));
		// $fields = new FieldList();
		// $fields->addFieldToTab( 'Root.Main', new TextField("Title", "Title"));
		// $fields->addFieldToTab( 'Root.Main', new TextField("Location", "Location"));
		// $fields->addFieldToTab( 'Root.Main', LinkField::create("LinkID", "Link"));
		// $fields->addFieldToTab('Root.Main', new TextField('HoursDateRange', 'Hours are for the following date range:'));
		// $fields->addFieldToTab('Root.Main', new TextareaField('RegularHours', 'Regular Hours'));
		// $fields->addFieldToTab('Root.Main', new TextareaField('ExceptionHours', 'Exception Hours'));


		return $fields;
	}
}
class BuildingDepartment_Controller extends Page_Controller {

	
	private static $allowed_actions = array (
	);

	public function init() {
		parent::init();


	}

}