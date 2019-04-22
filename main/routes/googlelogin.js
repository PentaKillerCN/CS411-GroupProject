function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  c$(".g-signin2").css("display", "none");
  $(".data").css("display", "block");
  $("#pic").attr("src", profile.getImageUrl());
  $("#email").text(profile.getEmail());
}