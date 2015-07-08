<?php
class MeetingRoomPage extends Page {

	private static $db = array(
	// Generic
	'Number' => 'Varchar',
	// Rates
	'StudentRate' => 'Varchar',
	'FacultyRate' => 'Varchar',
	'GeneralRate' => 'Varchar',
	// Capacities
	'TablesAndChairsCapacity' => 'Varchar',
	'RoundedTablesCapacity' => 'Varchar',
	'TheaterCapacity' => 'Varchar',
	'ClassroomCapacity' => 'Varchar',
	'UshapeCapacity' => 'Varchar',
	'BoardroomCapacity' => 'Varchar',
	// Amenities
	'HasComputer' => 'Boolean',
	'HasEthernetConnection' => 'Boolean',
	'HasProjectorScreen' => 'Boolean',
	'HasDVD' => 'Boolean',
	'HasSpeakers' => 'Boolean',
	'HasMarkerboard'	 => 'Boolean',
	'HasMicrophone'	 => 'Boolean',
	'HasWifi'	 => 'Boolean',
	'HasElectricPiano' => 'Boolean',
	'ExternalLink' => 'Text'
	);

	static $has_one = array(
		// 'ThumbnailImage'  => 'Image',
		'SlideshowImage1' => 'Image',
		'SlideshowImage2' => 'Image',
		'SlideshowImage3' => 'Image',
		'SlideshowImage4' => 'Image'
   );

   static $defaults = array (
		"HasWifi" => true
   );

	public function getCMSFields(){
		$fields = parent::getCMSFields();

		$fields->removeByName("Metadata");

		$fields->addFieldToTab('Root.Main', new TextField('ExternalLink', 'Redirect this page to the following URL:'), 'Content');

		// $fields->addFieldToTab('Root.Images', new UploadField('ThumbnailImage', 'Thumbnail Image (120 x 85)', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage1', 'Slideshow Image 1', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage2', 'Slideshow Image 2', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage3', 'Slideshow Image 3', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage4', 'Slideshow Image 4', null, null, null, $this->ClassName));

		// Generic
		$fields->addFieldToTab('Root.Main', new TextField('Number', 'Room Number'));
		// Rates
		$fields->addFieldToTab('Root.Rates', new TextField('StudentRate','Student Rate'));
		$fields->addFieldToTab('Root.Rates', new TextField('FacultyRate','Faculty Rate'));
		$fields->addFieldToTab('Root.Rates', new TextField('GeneralRate','General Rate'));

		// Capacities
		$fields->addFieldToTab('Root.Capacities', new TextField('TablesAndChairsCapacity','Tables & Chairs Capacity.  Put * after a capacity value to indicate a room\'s standard setup capacity.'));
		$fields->addFieldToTab('Root.Capacities', new TextField('RoundedTablesCapacity','Rounded Tables Capacity'));
		$fields->addFieldToTab('Root.Capacities', new TextField('TheaterCapacity','Theater Capacity'));
		$fields->addFieldToTab('Root.Capacities', new TextField('ClassroomCapacity','Classroom Capacity'));
		$fields->addFieldToTab('Root.Capacities', new TextField('UshapeCapacity','U-Shape Capacity'));
		$fields->addFieldToTab('Root.Capacities', new TextField('BoardroomCapacity','Board Room Capacity'));

		// Amenities
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasComputer','Has Computer?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasEthernetConnection','Has Ethernet Connection?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasProjectorScreen','Has Projector Screen?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasDVD','Has DVD Player?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasSpeakers','Has Speakers?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasMarkerboard','Has Markerboard?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasMicrophone','Has Microphone?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasWifi','Has Wifi?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasElectricPiano','Has Electric Piano?'));
		return $fields;

	}
	function getStandardCapacity () {
		$capacities = array(
			$this->TablesAndChairsCapacity,
			$this->RoundTablesCapacity,
			$this->TheaterCapacity,
			$this->ClassroomCapacity,
			$this->UshapeCapacity,
			$this->BoardroomCapacity
		);

		foreach($capacities as $capacity) {
			if (!is_null($capacity) && substr($capacity, -1, 1) == '*') { return substr($capacity, 0, -1); }
		}

		return false;
	}

	function getDisplayCapacity () {

		if ($this->getStandardCapacity()) {
			return $this->getStandardCapacity();
		} else {
			$capacities = array(
				(int) $this->TablesAndChairsCapacity,
				(int) $this->RoundTablesCapacity,
				(int) $this->TheaterCapacity,
				(int) $this->ClassroomCapacity,
				(int) $this->UshapeCapacity,
				(int) $this->BoardroomCapacity
			);
		}

		$capacities = array_filter($capacities);
		asort($capacities);
		$capacities = array_values($capacities);

		if (count($capacities) == 0) {
			return 'N/A';
		} elseif (count($capacities) == 1) {
			return $capacities[0];
		} else {
			return $capacities[0] . '-' . end($capacities);
		}

	}
}
class MeetingRoomPage_Controller extends Page_Controller {

	/**
	 * An array of actions that can be accessed via a request. Each array element should be an action name, and the
	 * permissions or conditions required to allow the user to access it.
	 *
	 * <code>
	 * array (
	 *     'action', // anyone can access this action
	 *     'action' => true, // same as above
	 *     'action' => 'ADMIN', // you must have ADMIN permissions to access this action
	 *     'action' => '->checkAction' // you can only access this action if $this->checkAction() returns true
	 * );
	 * </code>
	 *
	 * @var array
	 */
	private static $allowed_actions = array (
	);

	public function init() {
		parent::init();
		if($link = $this->ExternalLink) {
			$this->redirect($link, 301);
			return;
		}
	}

	public function HasAnyAmenities () {
    	return $this->HasComputer ||
    	       $this->HasEthernetConnection ||
    	       $this->HasProjector ||
    	       $this->HasDVD ||
    	       $this->HasWifi;
	}

}
