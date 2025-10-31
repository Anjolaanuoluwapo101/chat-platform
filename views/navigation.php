
<div class="navigation">
    <a class="secretVilleLogo">
        <span style="font-size:40px">SECRET</span>
        <span style="font-family:cursive;font-size:40px">VILLE</span>
    </a>
    <a onclick="showMenu()" style="padding-top:10px;vertical-align:middle;float:right;display:inline-block;margin-right:50px;line-height:90px;">
        <i class="fa fa-bars" style="font-size:70px"></i>
    </a>
</div>

<div class="showMenu" style="display:none;">
    <a href="/groups.php">GROUPS</a>
    <a href="index.php">CREATE NEW ACCOUNT</a>
    <a>CONTACT DEV</a>
    <a>CHECK DEV OTHER WORK <span style="color:red">coming soon</span></a>
</div>

<script>
function showMenu() {
    var menu = document.getElementsByClassName("showMenu")[0];
    menu.style.display = (menu.style.display === "none") ? "block" : "none";
}
</script>
