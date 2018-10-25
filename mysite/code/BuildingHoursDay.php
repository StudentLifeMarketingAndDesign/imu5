<?php

use SilverStripe\Forms\DateField;
use SilverStripe\ORM\DataObject;
class BuildingHoursDay extends DataObject {

	private static $db = array(

		    'Day' => 'Varchar(155)',
		    'DayShort' => 'Varchar(155)',
		    'OpenTime' => 'Time',
		   	'CloseTime' => 'Time',

		    'OpenAllDay' => 'Boolean',
		    'ClosedAllDay' => 'Boolean'
	);

	private static $has_many = array(
	
	);

	private static $allowed_children = array(
		
	);

	private static $hide_preview_panel = true;

	public function getCMSFields(){
		$fields = parent::getCMSFields();

		return $fields;

	}

}
