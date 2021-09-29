const navUl = document.querySelector('nav ul');
const burgerButton = document.querySelector('nav i');
const pullDown = document.querySelector('.pulldown');
const pullDownH1s = document.querySelectorAll('.pulldown h1');

class NavBar {
    constructor(burgerButton, navUl, pullDown) {
        this.burgerButton = burgerButton;
        this.navUl = navUl;
        this.pullDown = pullDown;
        this.toggleMenu = false;
        this.burgerButton.style.display = 'none';
        this.pullDown.style.height = '0px';
        this.openAndCloseNavBar = this.openAndCloseNavBar.bind(this);
        this.handleBurgerClick = this.handleBurgerClick.bind(this);
    }
    openAndCloseNavBar() {
        if (window.innerWidth <= 900) {
            this.navUl.style.display = 'none';
            this.burgerButton.style.display = 'block';
            this.burgerButton.style.marginLeft = 'auto';
            this.burgerButton.style.marginRight = '3%';
        } else {
            this.navUl.style.display = 'flex';
            this.burgerButton.style.display = 'none';
            this.pullDown.style.height = '0px';
            pullDownH1s.forEach(p => {
                p.style.display = 'none';
            });
        }
    }
    handleBurgerClick(evt) {
        console.log(this.pullDown.style.height)
        if (!this.toggleMenu) {
            this.pullDown.style.height = '150px';
            pullDownH1s.forEach(p => {
                setTimeout(() => {
                    p.style.display = 'block'
                },1000)
            })
            this.toggleMenu = true;
        } else {
            this.pullDown.style.height = '0px';
            pullDownH1s.forEach(p => {
                p.style.display = 'none';
            });
            this.toggleMenu = false;
        }
    }
}

let n = new NavBar(burgerButton, navUl, pullDown);
window.addEventListener('DOMContentLoaded', n.openAndCloseNavBar);
window.addEventListener('resize', n.openAndCloseNavBar);
burgerButton.addEventListener('click', n.handleBurgerClick);
