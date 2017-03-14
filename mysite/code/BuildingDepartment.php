<?php
class BuildingDepartment extends DataObject {

	private static $db = array(
		'Title' => 'Varchar',
		'Location' => 'Varchar',
		'Link' => 'Text',
		'SortOrder' => 'Int'
	);

	private static $has_one = array(
		'Buliding' => 'BuildingHoursPage'
	);

	private static $has_many = array(
		'RegularHours' => 'BuildingRegularHours',
		'ExceptionHours' => 'BuildingExceptionHours',
	);

	private static $summary_fields = array(
		'Title',
	);
	public function getCMSFields() {
		$fields = parent::getCMSFields();
		// $fields = new FieldList();
		$fields->addFieldToTab( 'Root.Main', new TextField("Title", "Title"));
		$fields->addFieldToTab( 'Root.Main', new TextField("Location", "Location"));
		$fields->addFieldToTab( 'Root.Main', new TextField("Link", "Link"));
		$fields->addFieldToTab( 'Root.Main', new TextField("SortOrder", "Sort Order"));

		$gridFieldConfigRegular = GridFieldConfig_RecordEditor::create(); 
		$gridfield = new GridField("Regular Hours", "Regular Building Hours", BuildingRegularHours::get(), $gridFieldConfigRegular);		
		$fields->addFieldToTab('Root.Main', $gridfield);

		$gridFieldConfigException = GridFieldConfig_RecordEditor::create(); 
		$gridfield = new GridField("Exception Hours", "Exception Building Hours", BuildingExceptionHours::get(), $gridFieldConfigException);		
		$fields->addFieldToTab('Root.Main', $gridfield);

		$fields->removeFieldFromTab('Root', 'RegularHours');
		$fields->removeFieldFromTab('Root', 'ExceptionHours');

		return $fields;
	}
}
