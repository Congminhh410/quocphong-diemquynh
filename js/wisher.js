import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBG4mZqaKApo0cgIHbVWmXi2fstVLFNgWs",
    authDomain: "fir-app-b7b20.firebaseapp.com",
    projectId: "fir-app-b7b20",
    storageBucket: "fir-app-b7b20.appspot.com",
    messagingSenderId: "996043254288",
    appId: "1:996043254288:web:4f7fd753220e558e4b7895",
    measurementId: "G-3QE9GLET5K"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const firebase_db = getFirestore(app);

// Secret key admin
const adminKey = "phongquynh123";

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
                addDoc(collection(firebase_db, "phong_quynh"), {
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

// Hiển thị danh sách lời chúc
async function displayWishes() {
    const wishesContainer = document.querySelector('.wish-box');
    wishesContainer.innerHTML = '';
    const q = query(collection(firebase_db, "phong_quynh"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    let isBg = false;

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const wishBoxItemClass = isBg ? "wish-box-item" : "wish-box-item bg";
        const wishItem = `
          <div class="${wishBoxItemClass}" data-id="${doc.id}">
            <strong>${data.name}</strong>
            <p>${data.content}</p>
            <button class="deleteWishBtn" style="display:none;">Xoá</button>
          </div>
        `;
        wishesContainer.insertAdjacentHTML('beforeend', wishItem);
        isBg = !isBg;
    });
}
document.addEventListener("DOMContentLoaded", displayWishes);

// Hàm xoá tất cả lời chúc
async function deleteAllWishes() {
    if (!confirm("Bạn có chắc chắn muốn xoá toàn bộ lời chúc không?")) {
        return; // nếu chọn Cancel thì dừng
    }
    const querySnapshot = await getDocs(collection(firebase_db, "phong_quynh"));
    for (const wishDoc of querySnapshot.docs) {
        await deleteDoc(doc(firebase_db, "phong_quynh", wishDoc.id));
    }
    alert("Đã xoá toàn bộ lời chúc!");
    displayWishes();
}
document.getElementById("deleteWishesBtn").addEventListener("click", deleteAllWishes);

// Hàm xoá lời chúc riêng lẻ
async function deleteWish(wishId) {
    if (!confirm("Bạn có chắc chắn muốn xoá lời chúc này không?")) {
        return;
    }
    await deleteDoc(doc(firebase_db, "phong_quynh", wishId));
    document.querySelector(`[data-id="${wishId}"]`).remove();
    alert("Đã xoá lời chúc!");
}

// Kiểm tra key admin
document.getElementById("checkKeyBtn").addEventListener("click", () => {
    const inputKey = document.getElementById("adminKeyInput").value;
    if (inputKey === adminKey) {
        document.getElementById("deleteWishesBtn").style.display = "inline-block";
        document.querySelectorAll(".deleteWishBtn").forEach(btn => {
            btn.style.display = "inline-block";
            btn.addEventListener("click", (e) => {
                const wishId = e.target.closest("div").getAttribute("data-id");
                deleteWish(wishId);
            });
        });
        alert("Bạn đã mở quyền admin!");
    } else {
        alert("Sai key, không có quyền xoá!");
    }
});
