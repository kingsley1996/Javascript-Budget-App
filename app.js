// BUDGET CONTROLLER
var budgetController = (function () {

    // Tạo ra các function constructor expense(id, description, value), income(id, description, value)
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = 1;
    };

    Expense.prototype.calculatePercentages = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentages = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Hàm calculateTotal(type) tính tổng giá trị expense và income
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(elm => sum += elm.value);
        data.totals[type] = sum;
    };


    // Tạo ra một đối tượng 'data' chứa các giá trị 'allItems' (chứa các mảng --- exp[], inc[]) 
    //  và 'totals' (chứa tổng giá trị của các item --- exp: 0, inc: 0)
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    // Return về các method public (addItem,...) 
    // addItem(type, des, val), tạo ra 1 item từ các constructor trên thông qua type(exp or inc)
    // Nếu mảng có số phần tử > 0 -> ID = id của phần tử cuối cùng của mảng + 1
    // Mảng chưa có phần tử -> ID = 0
    // kiểm tra nếu type là loại nào thì push vào mảng loại đó (exp[] or inc[]) 
    // addItem return về item vừa được tạo.
    return {
        // method addItem
        addItem: function (types, des, val) {
            var newItem, ID;
            if (data.allItems[types].length > 0) {
                ID = data.allItems[types][data.allItems[types].length - 1].id + 1;
            } else {
                ID = 1;
            }
            if (types === 'exp') {
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }
            data.allItems[types].push(newItem);
            return newItem;
        },

        // method deleteItem : xóa item khỏi mảng theo type và id của item đó
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(currentItem => currentItem.id);
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        // method calculateBudget 
        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we sent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        //method calculatePercentages
        calculatePercentages: function () {

            data.allItems.exp.forEach(cur => cur.calculatePercentages(data.totals.inc));

        },

        getPercentages: function () {

            var allPerc = data.allItems.exp.map(cur => cur.getPercentages());
            return allPerc;
        },


        //method getBudget return về đối tượng budget (budget, totalInc, totalExp, percentage)
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    }




})();

// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        itemPercentageLabel: ".item__percentage",
        container: ".container",
        titleDate: ".budget__title--month",
    }

    // Hàm formatNumber: định dang lại các dữ liệu là số trên giao diện
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        //chuyển số thành giá trị tuyệt đối(luôn dương)
        num = Math.abs(num);
        //làm tròn đến 2 chữ số hàng thập phân
        num = num.toFixed(2);
        // Tách số thành phần nguyên và phần thập phân
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            // input 23510 -> output 23,510
        }
        dec = numSplit[1];
        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
    };

    //Tạo ra hàm duyệt forEach cho nodeList
    var nodeListForEach = function (fields, callback) {
        for (var i = 0; i < fields.length; i++) {
            callback(fields[i], i);
        }
    };

    // *** Return về các method public (getInput,...)
    // getInput tiếp tục trả về một object chứa các giá trị cần lấy.
    // Tạo một object DOMstrings chứa các chuỗi để DOM tới các phần tử 
    // getDOMstrings : trả về DOMstrings
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                // Chuyển giá trị từ string -> number
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        // Tạo ra method addListItem(obj, type) để thêm item vào UI
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }


            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        // method deleteListItem(selectorID)
        deleteListItem: function (selectorID) {
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        // Method clearFields để xóa các text trong ô input khi đã nhấn thêm
        clearFields: function () {
            var fields, fieldArr
            //querySelectorALl DOM đến tất cả các phần tử có selector được truyền vào -> nodeList[elm1,elm2,...] 
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            //Dùng phương thức prototype của Array để copy 1 list -> array
            fieldArr = Array.prototype.slice.call(fields);
            //ForEach lặp các phần tử trong mảng và gán value cho từng phần tử = ''
            fieldArr.forEach((element, index, array) => element.value = '');
            //Phần tử vị trí 0 sẽ được mouse focus
            fieldArr[0].focus();
        },

        // Method displayBudget dùng để hiển thị budget ra ngoài UI
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
                // document.querySelector(DOMstrings.itemPercentageLabel).textContent = '---';
            }


        },

        //method displaypercentages : dùng để hiển thị phần trăm trên từng 'expense' trên UI
        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.itemPercentageLabel);



            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });
        },

        // method displayDate: hiển thị tháng, năm hiện tại
        displayDate: function () {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMstrings.titleDate).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    }



})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    /*  
        Tạo ra hàm setupEventListeners() và thực hiện : 
            - Lưu đối tượng DOMstrings ở UICtrl thông qua method getDOMstrings vào biến DOM
            - Gán trình xử lý sự kiện cho sự kiện click và enter, khi xảy ra sự kiện gọi tới hàm ctrlAddItem() 
    */

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();
        //gán trình xử lý sự kiện click nút thêm
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        //gán trình xử lý sự kiện nhấn phím enter(keyCode=13)
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })

        //gán ủy quyền sự kiện nút xóa cho phần tử cha 'container'
        document.querySelector(DOM.container).addEventListener("click", crtlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    // Hàm updateBudget để xử lý việc cập nhật lại ngân sách   
    var updateBudget = function () {
        console.log('Update working...');
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    // Hàm updatePercentage để xử lý cập nhật phần trăm cho từng expense

    var updatePercentages = function () {

        // 1. Calculate percentages

        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        budgetCtrl.getPercentages();
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages 
        UICtrl.displayPercentages(percentages);
    };

    // Hàm ctrlAddItem để xử lý task Thêm
    var ctrlAddItem = function () {

        // 1. Get the field input data

        //gán đối tượng được lấy về từ method getInput của UICtrl vào biến input
        var input = UICtrl.getInput();

        // Kiểm tra nếu giá trị người dùng nhập hợp lệ mới tiếp tục xử lý 
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }

    }

    // Hàm crtlDeleteItem để xử lý task xóa
    var crtlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseFloat(splitID[1]);

            // 1. delete the item from the data structure

            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI

            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget

            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }

    }

    // *** Return về một đối tượng chứa các method cần public (init,...)
    // Hàm init thực hiện gọi hàm setupEventListeners(), vì đang ở trong IIFE nên phải gọi hàm 
    // thông qua một phương thức public được trả về.    
    return {
        init: function () {
            console.log('App Running...!');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }


})(budgetController, UIController);

//Gọi hàm init để gọi tới các trình xử lý sự kiện khi lần đầu load
controller.init();
