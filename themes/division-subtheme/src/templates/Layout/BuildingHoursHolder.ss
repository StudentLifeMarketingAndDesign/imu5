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
				<% if $ActiveHoursPages %>
						<% with $ActiveHoursPages.First %>
							<h2>$Title</h2>
							<% if $EffectiveStartDate && $EffectiveEndDate %>
								<p><em>Effective from $EffectiveStartDate.Nice - $EffectiveEndDate.Nice</em></p>
							<% end_if %>

							<div>
								<p>Jump to:</p>
								<ul>
									<% loop $Children %>
										<li><a href="#{$URLSegment}">$Title</a></li>
									<% end_loop %>
								</ul>
							</div>
							<% loop $Children %>
								<h3 id="$URLSegment">$Title</h3>

								<% include BuildingHoursTable %>
								<% if not $Last %>
									<hr />
								<% end_if %>
							<% end_loop %>
						<% end_with %>
					<% end_if %>
	            $AfterContentConstrained
	            $Form
			</div>

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