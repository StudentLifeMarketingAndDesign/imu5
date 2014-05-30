<div class="module">
	<div class="inner">
		<% loop AfterClassEvents.Limit(4) %>
		<h3><a href='$link'> $Title </a></h3>
		<p>Coming Up On: $NextDateTime.NiceUS() </p>
		<% end_loop %>
	</div>
</div>