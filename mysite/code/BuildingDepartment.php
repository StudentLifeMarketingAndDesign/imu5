<?php
class BuildingDepartment extends Page {

	private static $db = array(
		'Location' => 'Varchar',

		'MonOpenTime' => 'Time',
		'MonCloseTime' => 'Time',

		'TuesOpenTime' => 'Time',
		'TuesCloseTime' => 'Time',

		'WedOpenTime' => 'Time',
		'WedCloseTime' => 'Time',

		'ThursOpenTime' => 'Time',
		'ThursCloseTime' => 'Time',

		'FriOpenTime' => 'Time',
		'FriCloseTime' => 'Time',

		'SatOpenTime' => 'Time',
		'SatCloseTime' => 'Time',

		'SunOpenTime' => 'Time',
		'SunCloseTime' => 'Time',

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
	public function getCMSFields() {
		$fields = parent::getCMSFields();
		$fields->removeByName('Content');
		$fields->removeByName('SortOrder');
		$fields->removeByName('LayoutType');
		$fields->removeByName('BackgroundImage');

		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("MonOpenTime","Open"),
		        TimeField::create("MonCloseTime","Closed")
		    )->setTitle('Monday')
		);

		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("TuesOpenTime","Open"),
		        TimeField::create("TuesCloseTime","Closed")
		    )->setTitle('Tuesday')
		);

		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("WedOpenTime","Open"),
		        TimeField::create("WedCloseTime","Closed")
		    )->setTitle('Wednesday')
		);

		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("ThursOpenTime","Open"),
		        TimeField::create("ThursCloseTime","Closed")
		    )->setTitle('Thursday')
		);
		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("FriOpenTime","Open"),
		        TimeField::create("FriCloseTime","Closed")
		    )->setTitle('Friday')
		);
		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("SatOpenTime","Open"),
		        TimeField::create("SatCloseTime","Closed")
		    )->setTitle('Saturday')
		);
		$fields->addFieldToTab(
		    'Root.Main',
		    FieldGroup::create(
		        TimeField::create("SunOpenTime","Open"),
		        TimeField::create("SunCloseTime","Closed")
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