<?php

use SilverStripe\Assets\Image;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\AssetAdmin\Forms\UploadField;
use SilverStripe\Forms\CheckboxField;

class MeetingRoomPage extends Page {

	private static $db = array(
		// Generic
		'Number' => 'Varchar',
		// Rates
		'StudentRate' => 'Varchar',
		'FacultyRate' => 'Varchar',
		'GeneralRate' => 'Varchar',
		// Capacities
		'CapacityToShowOnHolder' => 'Varchar',
		'TablesAndChairsCapacity' => 'Varchar',
		'RoundedTablesCapacity'   => 'Varchar',
		'TheaterCapacity'         => 'Varchar',
		'ClassroomCapacity'       => 'Varchar',
		'UshapeCapacity'          => 'Varchar',
		'BoardroomCapacity'       => 'Varchar',
		'FormerlyKnownAs'		  => 'Varchar(155)',
		// Amenities
		'HasComputer'                    => 'Boolean',
		'HasEthernetConnection'          => 'Boolean',
		'HasProjector' => 'Boolean',
		'HasProjectorScreen'             => 'Boolean',
		'HasDVD'                         => 'Boolean',
		'HasBluRay'					     => 'Boolean',
		'HasSpeakers'                    => 'Boolean',
		'HasMarkerboard'                 => 'Boolean',
		'HasMicrophone'                  => 'Boolean',
		'HasWifi'                        => 'Boolean',
		'HasElectricPiano'               => 'Boolean',

		'ExternalLink'                   => 'Text',
		'ComplimentaryEquipmentProvided' => 'Boolean',
		'ShowSetupChangeFee' => 'Boolean',
		'SetupChangeFee'	=> 'Text',
		'ShowRoomLayout' => 'Boolean',
		'ContactInfo' => 'HTMLText',
	);

	private static $has_one = array(
		// 'ThumbnailImage'  => 'Image',
		'SlideshowImage1' => Image::class,
		'SlideshowImage2' => Image::class,
		'SlideshowImage3' => Image::class,
		'SlideshowImage4' => Image::class,
		'SlideshowImage5' => Image::class,
		'SlideshowImage6' => Image::class,
		'SlideshowImage7' => Image::class,
		'SlideshowImage8' => Image::class,

	);

	private static $owns = array(
		'SlideshowImage1',
		'SlideshowImage2',
		'SlideshowImage3',
		'SlideshowImage4',
		'SlideshowImage5',
		'SlideshowImage6',
		'SlideshowImage7',
		'SlideshowImage8'
	);

	private static $defaults = array(
		"HasWifi" => true
	);

	public function getCMSFields() {
		$fields = parent::getCMSFields();

		$fields->removeByName("Metadata");

		$fields->addFieldToTab('Root.Main', new TextField('ExternalLink', 'Redirect this page to the following URL:'), 'Content');
		$fields->addFieldToTab('Root.Main', HTMLEditorField::create('ContactInfo', 'Show this contact or reservation information in the footer instead of the default "contact IMU Event Services text"')->setRows(3));
		
		// $fields->addFieldToTab('Root.Images', new UploadField('ThumbnailImage', 'Thumbnail Image (120 x 85)', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage1', 'Slideshow Image 1', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage2', 'Slideshow Image 2', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage3', 'Slideshow Image 3', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage4', 'Slideshow Image 4', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage5', 'Slideshow Image 5', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage6', 'Slideshow Image 6', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage7', 'Slideshow Image 7', null, null, null, $this->ClassName));
		$fields->addFieldToTab('Root.Images', new UploadField('SlideshowImage8', 'Slideshow Image 8', null, null, null, $this->ClassName));

		// Generic
		$fields->addFieldToTab('Root.Main', new CheckboxField('ShowRoomLayout', 'Show layouts?'), 'Content');

		$fields->addFieldToTab('Root.Main', new TextField('Number', 'Room Number'), 'Content');
		$fields->addFieldToTab('Root.Main', new TextField('FormerlyKnownAs', 'Formerly known as'), 'Content');
		// Rates
		$fields->addFieldToTab('Root.Rates', new TextField('StudentRate', 'Student Rate'));
		$fields->addFieldToTab('Root.Rates', new TextField('FacultyRate', 'Faculty Rate'));
		$fields->addFieldToTab('Root.Rates', new TextField('GeneralRate', 'General Rate'));


		// Capacities
		$fields->addFieldToTab('Root.Capacities', new TextField('CapacityToShowOnHolder', 'Show the following capacity on the holder page (e.g., Up to 700)'));
		$fields->addFieldToTab('Root.Capacities', new TextField('TablesAndChairsCapacity', 'Tables & Chairs Capacity.  Put * after a capacity value to indicate a room\'s standard setup capacity.'));
		$fields->addFieldToTab('Root.Capacities', new TextField('RoundedTablesCapacity', 'Rounded Tables Capacity'));
		$fields->addFieldToTab('Root.Capacities', new TextField('TheaterCapacity', 'Theater Capacity'));
		$fields->addFieldToTab('Root.Capacities', new TextField('ClassroomCapacity', 'Classroom Capacity'));
		$fields->addFieldToTab('Root.Capacities', new TextField('UshapeCapacity', 'U-Shape Capacity'));
		$fields->addFieldToTab('Root.Capacities', new TextField('BoardroomCapacity', 'Board Room Capacity'));

		$fields->addFieldToTab('Root.Capacities', new CheckboxField('ShowSetupChangeFee', 'Show minimum setup change fee?'));
		$fields->addFieldToTab('Root.Capacities', new TextField('SetupChangeFee', 'Minimum setup change fee (include dollar sign)'));
		
		// Amenities
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasComputer', 'Has Computer?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasEthernetConnection', 'Has Ethernet Connection?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasProjectorScreen', 'Has Projector Screen?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasProjector', 'Has Projector?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasDVD', 'Has DVD Player?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasBluRay', 'Has Blu-ray Player?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasSpeakers', 'Has Speakers?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasMarkerboard', 'Has Markerboard?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasMicrophone', 'Has Microphone?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasWifi', 'Has Wifi?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('HasElectricPiano', 'Has Electric Piano?'));
		$fields->addFieldToTab('Root.Amenities', new CheckboxField('ComplimentaryEquipmentProvided', 'Has Complimentary Equipment Provided?'));

		return $fields;

	}
	function getStandardCapacity() {
		$capacities = array(
			$this->TablesAndChairsCapacity,
			$this->RoundTablesCapacity,
			$this->TheaterCapacity,
			$this->ClassroomCapacity,
			$this->UshapeCapacity,
			$this->BoardroomCapacity
		);

		foreach ($capacities as $capacity) {
			if (!is_null($capacity) && substr($capacity, -1, 1) == '*') {return substr($capacity, 0, -1);}
		}

		return false;
	}

	function getDisplayCapacity() {

		if($this->CapacityToShowOnHolder){
			return $this->CapacityToShowOnHolder;
		}
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
			return false;
		} elseif (count($capacities) == 1) {
			return $capacities[0];
		} else {
			return $capacities[0].'-'.end($capacities);
		}

	}
	public function HasAnyAmenities() {
		return $this->HasComputer ||
		$this->HasEthernetConnection ||
		$this->HasProjector ||
		$this->HasDVD ||
		$this->HasWifi;
	}
}
