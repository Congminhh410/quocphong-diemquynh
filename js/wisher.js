import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Cấu hình Firebase
const firebaseConfig = {
    // apiKey: "AIzaSyBG4mZqaKApo0cgIHbVWmXi2fstVLFNgWs",
    // authDomain: "fir-app-b7b20.firebaseapp.com",
    // projectId: "fir-app-b7b20",
    // storageBucket: "fir-app-b7b20.appspot.com",
    // messagingSenderId: "996043254288",
    // appId: "1:996043254288:web:4f7fd753220e558e4b7895",
    // measurementId: "G-3QE9GLET5K"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const firebase_db = getFirestore(app);

(function ($) {
    if ($("#wish-form").length) {
        $("#wish-form").validate({
            rules: {
                name: {
                    required: true,
                    minlength: 5
                },
                content: {
                    required: true,
                    minlength: 10
                },
                email: {
                    required: false,
                    email: true
                },
            },

            messages: {
                name: {
                    required: 'Vui lòng nhập tên của bạn.',
                    minlength: 'Tên phải lớn hơn 5 ký tự.',
                },
                content: {
                    required: 'Vui lòng nhập lời chúc.',
                    minlength: 'Lời chúc phải lớn hơn 10 ký tự.',
                },
                email: {
                    email: 'Địa chỉ email không hợp lệ.'
                }
            },

            errorPlacement: function (error, element) {
                if (element.attr("name") == "content") {
                    error.insertAfter("#wish-form .vitualTextarea");
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function (form) {
                $("#loader").css("display", "inline-block");

                // Lấy giá trị từ form
                const name = $(form).find("input[name='name']").val();
                const content = $(form).find("textarea[name='content']").val();
                const email = $(form).find("input[name='email']").val() || null; // Optional

                // Thêm dữ liệu vào Firestore
                addDoc(collection(firebase_db, "huy_huong"), {
                    name: name,
                    content: content,
                    email: email,
                    timestamp: serverTimestamp()
                })
                .then((docRef) => {
                    $("#loader").hide();

                    // Thêm lời chúc mới lên giao diện
                    $('.wish-box').scrollTop(0);
                    $('.wish-box').prepend('<div class="wish-box-item bg"><strong>' + 
                        name.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") + 
                        '</strong><p>' + 
                        content.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") + 
                        '</p></div>');

                    $("#success").html('Lời chúc của bạn đã được gửi thành công!').slideDown("slow");
                    setTimeout(function () {
                        $("#success").slideUp("slow");
                    }, 5000);

                    form.reset();
                })
                .catch((error) => {
                    $("#loader").hide();
                    $("#error").html('Có lỗi xảy ra khi gửi lời chúc. Vui lòng thử lại.').slideDown("slow");
                    setTimeout(function () {
                        $("#error").slideUp("slow");
                    }, 5000);
                    console.error("Error adding document: ", error);
                });

                return false;
            }
        });
    }
})(window.jQuery);

document.addEventListener("DOMContentLoaded", function (){
    async function displayWishes() {
        const wishesContainer = document.querySelector('.wish-box');
        wishesContainer.innerHTML = ''; // Xóa nội dung cũ

        const q = query(collection(firebase_db, "huy_huong"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        let isBg = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const wishBoxItemClass = isBg === true ? "wish-box-item" : "wish-box-item bg";

            // Tạo phần tử hiển thị lời chúc
            const wishItem = `
                <div class="${wishBoxItemClass}">
                    <strong>${data.name.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</strong>
                    <p>${data.content.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</p>
                </div>
            `;

            // Chèn phần tử vào container
            wishesContainer.insertAdjacentHTML('beforeend', wishItem);
            isBg = !isBg;
        });
    }

    displayWishes();
});
