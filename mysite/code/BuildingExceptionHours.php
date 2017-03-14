<?php
class BuildingExceptionHours extends DataObject {

	private static $db = array(
		'OpenTime' => 'Time',
		'CloseTime' => 'Time',
		'Notes' => 'HTMLText',
		'StartDate' => 'Date',
		'EndDate' => 'Date'
	);

	private static $has_one = array(
		'Department' => 'BuildingDepartment',
	);

	private static $summary_fields = array(
		'StartDate',
		'EndDate'
	);

	public function getCMSFields() {
		$fields = parent::getCMSFields();

		$fields->addFieldToTab( 'Root.Main', TimeField::create("OpenTime", "Open Time"));
		$fields->addFieldToTab( 'Root.Main', TimeField::create("CloseTime", "Close Time"));
		$startDateField = DateField::create('StartDate')->setConfig('showcalendar', true);
		$endDateField = DateField::create('EndDate')->setConfig('showcalendar', true);
		$fields->addFieldToTab( 'Root.Main', new HTMLEditorField("Notes", "Additional Notes"));

		return $fields;
	}
}
