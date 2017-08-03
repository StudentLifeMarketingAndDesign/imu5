<?php
class BuildingDepartment extends DataObject {

	private static $db = array(
		'Title' => 'Varchar',
		'Location' => 'Varchar',
		'SortOrder' => 'Int',
		'HoursDateRange' => 'Text',
		'RegularHours' => 'Text',
		'ExceptionHours' => 'Text'
	);

	private static $has_one = array(
		'Page' => 'BuildingHoursPage',
		'Link' => 'Link'
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
		// $fields = new FieldList();
		$fields->addFieldToTab( 'Root.Main', new TextField("Title", "Title"));
		$fields->addFieldToTab( 'Root.Main', new TextField("Location", "Location"));
		$fields->addFieldToTab( 'Root.Main', LinkField::create("LinkID", "Link"));
		$fields->addFieldToTab('Root.Main', new TextField('HoursDateRange', 'Hours are for the following date range:'));
		$fields->addFieldToTab('Root.Main', new TextareaField('RegularHours', 'Regular Hours'));
		$fields->addFieldToTab('Root.Main', new TextareaField('ExceptionHours', 'Exception Hours'));


		return $fields;
	}
}