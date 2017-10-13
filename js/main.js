(function() {
    'use strict'
    angular.module('myApp', []);

    angular.module('myApp').controller('lineGameCtl', ['$scope', function($scope) {
        // 声明一些重要变量 console.log('lineGameCtl');
        $scope.curPoint = null;
        $scope.oldPoint = null;
        $scope.tempPoint = [];
        $scope.imgTypes = [{
            imgType: 'pangxie',
            value: '螃蟹'
        }, {
            imgType: 'jitui',
            value: '鸡腿'
        }, {
            imgType: 'zao',
            value: '枣'
        }, {
            imgType: 'yuebing',
            value: '月饼'
        }];
        $scope.curImgType = $scope.imgTypes[0]; // 图片地址

        $scope.imgTypesChange = function(obj) { // 图片类型 改变事件
            console.log('imgTypesChange', obj);
            $scope.curImgType = obj;
        };

        $scope.curContent = { // 定义当前对象
            rows: 8, // 行数
            columns: 8, // 列数
            curArray: [] // 点阵数组
        };

        $scope.curClick = function(x, y, v) { // 点击事件
            console.log('curClick', x, y, v);
            var p = {
                x: x,
                y: y,
                value: v
            }
            if ($scope.curPoint == null) {
                $scope.curPoint = p;
            } else {
                if ($scope.curPoint.x != x || $scope.curPoint.y != y) {
                    $scope.oldPoint = $scope.curPoint;
                    $scope.curPoint = p;

                    // 判断两点是否可消
                    if (eliminate($scope.oldPoint, $scope.curPoint)) {
                        if (eliminate_0($scope.oldPoint, $scope.curPoint, $scope.curContent.curArray)) {
                            console.log("可以0折线消除");
                            $scope.resetPoint($scope.oldPoint, $scope.curPoint);
                        } else if (eliminate_1($scope.oldPoint, $scope.curPoint, $scope.curContent.curArray)) {
                            console.log("可以1折线消除");
                            $scope.resetPoint($scope.oldPoint, $scope.curPoint);
                        } else if (eliminate_2($scope.oldPoint, $scope.curPoint, $scope.curContent.curArray)) {
                            console.log("可以2折线消除");
                            $scope.resetPoint($scope.oldPoint, $scope.curPoint);
                        } else {
                            console.log("不可以消除");
                        }
                    } else {
                        console.log("不满足消除基本条件");
                    }
                }
            }
            console.log('point', $scope.oldPoint, $scope.curPoint);
        };

        // 初始化数组
        $scope.setArrayValue = function() {
            var rows = $scope.curContent.rows; // 行数
            var columns = $scope.curContent.columns; // 列数
            var counts = rows * columns; // 总数

            // 判断是否为偶数个
            if (counts % 2 != 0) {
                console.log('数组不符合偶数');
                return;
            }

            // 生成一个 总数长度 的一维数组
            var data = new Array();
            for (var i = 0; i < counts / 2; i++) {
                // 生成一个 一半总数长度 的一维数组
                data[i] = GetRandomNum(1, 8);
            }
            // 对 一半总数长度 数组 进行合并，确保总数长度数组里面的值是成对出现的
            data = data.concat(data);
            console.log('data', data);


            var arr = new Array(); // 大数组
            for (var r = 0; r <= rows + 1; r++) {
                arr[r] = new Array();
                for (var c = 0; c <= columns + 1; c++) {
                    if (r == 0 || c == 0 || r == rows + 1 || c == columns + 1) {
                        arr[r][c] = 0;
                    } else {
                        // 取得一个随机数
                        var i = GetRandomNum(0, data.length - 1);
                        arr[r][c] = data[i];
                        data.splice(i, 1); // 数组消除
                    }
                }
            }
            $scope.curContent.curArray = arr; // 最终数组
        }
        $scope.setArrayValue();
        console.log('setArrayValue', $scope.curContent.curArray);

        $scope.resetPoint = function(p1, p2) { // 消除两个点
            $scope.curContent.curArray[p1.y][p1.x] = 0;
            $scope.curContent.curArray[p2.y][p2.x] = 0;
            $scope.curPoint = null;
            $scope.oldPoint = null;
            console.log('resetPoint', p1, p2, $scope.tempPoint, $scope.curContent.curArray);
            $scope.tempPoint = [];
        }

        // 算法部分--消除算法
        function eliminate(p1, p2) { // 基本判断，看两个点是否存在消除的必要条件：不是同一个点且值相同
            if (p1.x == p2.x && p1.y == p2.y) {
                return false; // 如果两个点是一个点，不满足条件
            } else {
                if (p1.value == p2.value) {
                    return true;
                } else {
                    return false; // 如果两个点的值不相同，不满足条件
                }
            }
        };
        // 消除-- 0折线消除
        function eliminate_0(p1, p2, arr) { // 首先要满足基本判断
            if (p1.x == p2.x && p1.y != p2.y) { // x 坐标相同
                if (Math.abs(p1.y - p2.y) == 1) {
                    return true;
                }
                for (var i = Math.min(p1.y, p2.y) + 1; i < Math.max(p1.y, p2.y); i++) {
                    if (arr[i][p1.x] != 0) {
                        return false;
                    }
                }
                return true;
            } else if (p1.x != p2.x && p1.y == p2.y) { // y 坐标相同
                if (Math.abs(p1.x - p2.x) == 1) {
                    return true;
                }
                for (var i = Math.min(p1.x, p2.x) + 1; i < Math.max(p1.x, p2.x); i++) {
                    if (arr[p1.y][i] != 0) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        };
        // 消除-- 1折线消除
        function eliminate_1(p1, p2, arr) {
            // 寻找两个折点 p3,p4
            var p3 = {
                x: p1.x,
                y: p2.y,
                value: arr[p2.y][p1.x]
            }
            var p4 = {
                x: p2.x,
                y: p1.y,
                value: arr[p1.y][p2.x]
            }

            // 验证折点p3是否可行
            if (p3.value == 0 && eliminate_0(p1, p3, arr) && eliminate_0(p2, p3, arr)) {
                $scope.tempPoint.push(p3);
                return true;
            } else if (p4.value == 0 && eliminate_0(p1, p4, arr) && eliminate_0(p2, p4, arr)) {
                $scope.tempPoint.push(p4);
                return true;
            } else {
                return false;
            }
        };
        // 消除-- 2折线消除
        function eliminate_2(p1, p2, arr) {
            // 寻找x方向上的中间结点
            for (var i = 0; i < $scope.curContent.rows + 2; i++) {
                var p = {
                    x: i,
                    y: p1.y,
                    value: arr[p1.y][i]
                }
                if (p.value == 0 && eliminate_0(p, p1, arr) && eliminate_1(p, p2, arr)) {
                    $scope.tempPoint.push(p);
                    return true;
                }
            }
            // 寻找y方向上的中间结点
            for (var i = 0; i < $scope.curContent.columns + 2; i++) {
                var p = {
                    x: p1.x,
                    y: i,
                    value: arr[i][p1.x]
                }
                if (p.value == 0 && eliminate_0(p, p1, arr) && eliminate_1(p, p2, arr)) {
                    $scope.tempPoint.push(p);
                    return true;
                }
            }
        }

        // 获取随机数
        function GetRandomNum(Min, Max) {
            var Range = Max - Min;
            var Rand = Math.random();
            return (Min + Math.round(Rand * Range));
        };
    }])
})();
