
$Header
<main class="main-content__container" id="main-content__container">

	<!-- Background Image Feature -->
	<% if $BackgroundImage %>
		<% include FeaturedImage %>
	<% end_if %>
	
	<% if not $BackgroundImage %>
		<div class="column row">
	        <div class="main-content__header">
	            $Breadcrumbs
				<h1>$Title</h1>
			</div>
		</div>
	<% end_if %>

	$BeforeContent

	<div class="row">

		<div class="main-content main-content--with-padding <% if $SiteConfig.ShowExitButton %>main-content--with-exit-button-padding<% end_if %> <% if $Children || $Menu(2) || $SidebarArea.Elements ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
			$BeforeContentConstrained
			<% if $MainImage %>
				<img class="main-content__main-img" src="$MainImage.ScaleMaxWidth(500).URL" alt="" role="presentation"/>
			<% end_if %>
			<div class="main-content__text">
				$Content

					<% if $EffectiveStartDate && $EffectiveEndDate %>
						<p><em>Effective from $EffectiveStartDate.Nice - $EffectiveEndDate.Nice</em></p>
					<% end_if %>
					<% loop $Children %>
						<h2>$Title</h2>
						<p><a href="$CMSEditLink" class="button" target="_blank">Edit {$Title} hours</a></p>
					<% end_loop %>
	            $AfterContentConstrained
	            $Form
			</div>

			<% if $ShowChildPages %>
				<% include ChildPages %>
			<% end_if %>

		</div>
		<aside class="sidebar dp-sticky">
			<% include SideNav %>
			<% if $SideBarView %>
				$SideBarView
			<% end_if %>
			$SidebarArea
		</aside>
	</div>
$AfterContent


</main>
