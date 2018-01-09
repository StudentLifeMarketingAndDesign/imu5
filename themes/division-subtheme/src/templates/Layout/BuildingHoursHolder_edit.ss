$Header
<main class="main-content__container" id="main-content__container">

	<!-- Background Image Feature -->
	<% if $BackgroundImage %>
		<% include FeaturedImage %>
	<% end_if %>
	$Breadcrumbs

	<% if not $BackgroundImage %>
		<div class="column row">
			<div class="main-content__header">
				<h1>$Title</h1>
			</div>
		</div>
	<% end_if %>

	$BlockArea(BeforeContent)

	<div class="row">

		<article role="main" class="main-content main-content--with-padding <% if $SiteConfig.ShowExitButton %>main-content--with-exit-button-padding<% end_if %> <% if $Children || $Menu(2) || $SidebarBlocks ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
			$BlockArea(BeforeContentConstrained)
			<div class="main-content__text">
				<% with $ActiveHoursPages.First %>
					<h2>$Title</h2>
					<% if $EffectiveStartDate && $EffectiveEndDate %>
						<p><em>Effective from $EffectiveStartDate.NiceUS - $EffectiveEndDate.NiceUS</em></p>
						<p><a href="$CMSEditLink" class="button" target="_blank">Edit effective dates</a></p>
					<% end_if %>
					<% loop $Children %>
						<h3>$Title</h3>
						<p><a href="$CMSEditLink" class="button" target="_blank">Edit {$Title} hours</a></p>
					<% end_loop %>
				<% end_with %>
			</div>
			$BlockArea(AfterContentConstrained)
			$Form
		</article>
		<aside class="sidebar dp-sticky">
			<% include SideNav %>
			<% if $SideBarView %>
				$SideBarView
			<% end_if %>
			$BlockArea(Sidebar)
		</aside>
	</div>
	$BlockArea(AfterContent)

</main>