angular.module('App', ['ngRoute','ui.bootstrap','angularFileUpload','ngCookies'])
.config(function($routeProvider, $locationProvider, $httpProvider,$provide) {
    //$locationProvider.html5Mode(true).hashPrefix('!');
    $routeProvider
        .when('/profile', {
            controller:'ProfileCtrl',
            templateUrl:'profile.html',
            resolve: {
                tasks: function (ProfileTasks) {
                    return ProfileTasks.getTaskList();
                },
                users: function (Users) {
                    return Users.getUserList();
                },
                title: function (Title) {
                    Title.setTitle('Профиль пользователя');
                }
            }
        })
        .when('/task_list', {
            controller:'ListCtrl',
            templateUrl:'view_task_list.html',
            resolve: {
                tasks: function (Tasks) {
                    return Tasks.getTaskList();
                },
                users: function (Users) {
                    return Users.getUserList();
                },
                title: function (Title) {
                    Title.setTitle('Фильтр задач');
                }
            }
        })
        .when('/view_task/:taskId', {
            controller:'ViewCtrl',
            templateUrl:'view_task.html',
            resolve: {
                task: function (Task, $route) {
                    return Task.getTaskById($route.current.params.taskId);
                },
                users: function (Users) {
                    return Users.getUserList();
                },
                title: function (Title) {
                    Title.setTitle('Просмотр задачи');
                }
            }
        })
        .when('/edit_task/:taskId', {
            controller:'EditCtrl',
            templateUrl:'edit_task.html',
            resolve: {
                task: function (Task, $route) {
                    return Task.getTaskById($route.current.params.taskId);
                },
                users: function (Users) {
                    return Users.getUserList();
                },
                title: function (Title) {
                    Title.setTitle('Редактирование задачи');
                }
            }
        })
        .when('/new_task', {
            controller:'CreateCtrl',
            templateUrl:'new_task.html',
            resolve: {
                users: function (Users) {
                    return Users.getUserList();
                },
                checkStatus : function ($http) {
                    $http.get('php/check_user.php');
                },
                title: function (Title) {
                    Title.setTitle('Создание задачи');
                }
            }
        })
        .when('/add_checklist', {
            controller:'AddCheckListCtrl',
            templateUrl:'add_checklist.html',
            resolve: {
                users: function (Users) {
                    return Users.getUserList();
                },/*
                checkStatus : function ($http) {
                    $http.get('php/check_user.php');
                },*/
                title: function (Title) {
                    Title.setTitle('Создание чеклиста');
                }
            }
            
        })
        .when('/auth', {
            controller:'AuthCtrl',
            templateUrl:'auth.html',
            resolve: {
                users: function (Users) {
                    return Users.getUserList();
                },
                title: function (Title) {
                    Title.setTitle('Страница авторизации');
                }
            }
        })
        .otherwise({
            redirectTo:'/profile'
        });
        $httpProvider.interceptors.push('response');
})
.factory('Title', function(){
    var title = '';
    return {
        title: function() { return title; },
        setTitle: function(newTitle) { title = newTitle; }
    };
})
.factory('response', function ($location) {
    return {
        response: function (response) {
            console.log(response);
            if(response.data && response.data.status === "error" && response.data.response.message === "auth_mismatch") {
                alert('Ваша сессия закончилась. Пожалуйста, войдите заново!');
                $location.path('/auth');
            }
            if(response.data && response.data.status === "surprise" && response.data.response.message === "auth_mismatch") {
                alert('Ваша сессия закончилась. Пожалуйста, войдите заново!');
                $location.path('/auth');
            }
            return response || $q.when(response);
        }
    };
})
.service('Tasks', function($http, $q, $filter, $routeParams, $location) {
    var self = this;
    this.getTaskList = function () {
        var user_id = $location.search().user_id
        //if (this.tasks) return $q.when(this.tasks);
        var obj = {
            time_term_from: $filter('date')(new Date(),"yyyy-MM-dd"),
            time_term_to: $filter('date')(new Date(),"yyyy-MM-dd")
        };
        user_id ? obj.responsible = user_id : '';
        if(user_id) {
            delete obj.time_term_to;
            delete obj.time_term_from;
        }
        return $http({
            url: 'php/view_task_list.php',
            method: "GET",
            params: obj
        }).then(function (response){
            var deferred = $q.defer();
            if(response.data) {
                if(response.data.status === "ok") {
                    self.tasks = response.data.response;
                    user_id ? self.tasks.responsible = user_id : '';
                    deferred.resolve(self.tasks);
                }

                if(response.data.status === "surprise") {
                    self.tasks = [];
                    deferred.resolve(self.tasks);
                    self.taskError = response.data.response;
                    user_id ? self.tasks.responsible = user_id : '';
                }
                return deferred.promise;
            }
        });
    }
})
.service('ProfileTasks', function($http, $q, $filter) {
    var self = this;
    this.getTaskList = function () {
        if (this.tasks) return $q.when(this.tasks);
        return $http({
            url: 'php/profile.php',
            method: "GET"
        }).then(function (response){
            var deferred = $q.defer();
            if(response.data) {
                if(response.data.status === "ok") {
                    self.tasks = response.data.response;
                    deferred.resolve(self.tasks);
                }

                if(response.data.status === "surprise") {
                    self.tasks = [];
                    deferred.resolve(self.tasks);
                    self.taskError = response.data.response;
                }
                return deferred.promise;
            }
        });
    }
})
.service('Users', function($http, $q) {
    var self = this;
    this.getUserList = function () {
        if (this.userlist) return $q.when(this.userlist);
        return $http.get('php/get_users.php').then(function (response){
            var deferred = $q.defer();
            if(response.data) {
                if(response.data.status === "ok") {
                    self.userlist = response.data.response;
                    deferred.resolve(self.userlist);
                }
                if(response.data.status === "surprise") {
                    self.taskError = response.data.response;
                }
                return deferred.promise;
            }
        });
    }
})
.service('Task', function($http, $q) {
    var self = this;
    this.getTaskById = function (id) {
        return $http.get('php/view_task.php?task_id='+ id).then(function (response){
            var deferred = $q.defer();
            if(response.data) {
                if(response.data.status === "ok") {
                    self.task = response.data.response;
                    deferred.resolve(self.task);
                }
                if(response.data.status === "surprise") {
                    self.taskError = response.data.response;
                }
                return deferred.promise;
            }
        });
    };
    this.getComentsByTaskId = function (id) {
        return $http.get('coments-'+ id +'.json').then(function (response){
            var deferred = $q.defer();
            if(response.data) {
                if(response.data.status === "ok") {
                    self.task = response.data.response;
                    deferred.resolve(self.task);
                }
                if(response.data.status === "surprise") {
                    self.taskError = response.data.response;
                }
                return deferred.promise;
            }
        });
    }
})
.controller('TitleCtrl', function ($scope, Title) {
    $scope.Page = Title;
})
.controller('AddCheckListCtrl', function($scope, users, $upload, $http, $filter, $route) {
    $scope.users = users;
    $scope.checklist_item_proto = function(){
        return {
            "text":"",
            "active":true,
            "pos": $scope.new_checklist.length
        }
    }
    
    $scope.new_checklist = [
        {
            "text":"Первое задание",
            "active":true,
            "pos":0
        },{
            "text":"Второе задание",
            "active":true,
            "pos":1
        }
    ];
    
    $scope.predicate = "pos";
    $scope.reverse = false;
    
    $scope.move_new_checklist_item = function(dir, item_pos){
        
        /*
        var test_array=[];
        for(i=0;i<$scope.new_checklist.length;i++){test_array[i] = $scope.new_checklist[i].pos;}
        console.log(test_array);
        */
        
        var the_item = "none", item_to_change = "none";
        
        var pos_to_change = dir == "up" ? item_pos-1 : item_pos+1;
        
        // seeking item to swap
        for(i=0;i<$scope.new_checklist.length;i++){
            if($scope.new_checklist[i].pos == pos_to_change){
                item_to_change = i;
            };
            if($scope.new_checklist[i].pos == item_pos){
                the_item = i;
            }
        }
        
        if(the_item == "none"){
            alert("Не найден исходный элемент");
            return;
        }
        
        if(item_to_change != "none"){
            $scope.new_checklist[the_item].pos=pos_to_change;
            $scope.new_checklist[item_to_change].pos=item_pos;
        }
    }
    
    $scope.add_new_checklist_item = function(){
        $scope.new_checklist[$scope.new_checklist.length] = new $scope.checklist_item_proto;
        console.log($scope.new_checklist);
    }
    
    $scope.delete_new_checklist_item = function(order_hole){
        // seeking element with the hole
        var index_hole = "none";
        for(var i=0; i < $scope.new_checklist.length; i++)     {
            if($scope.new_checklist[i].pos == order_hole){
                index_hole = i;
            }
        }
        
        if(index_hole == "none"){
            alert("Не найден элемент для удаления");
            return;
        }
        
        for(var i=0; i<$scope.new_checklist.length; i++)     {
            // offseting order
            if($scope.new_checklist[i].pos>order_hole){
                $scope.new_checklist[i].pos +=  -1;
            }
        }
        
        for(var i=0; i<$scope.new_checklist.length; i++)     {
            // offseting array
            if(i>=index_hole && i<$scope.new_checklist.length-1){
                $scope.new_checklist[i]=$scope.new_checklist[i+1];
            };
        }
        $scope.new_checklist.pop(); 
    }
        
    
})
.controller('ListCtrl', function($scope, tasks, users, $http, $filter) {
    $scope.tasks = tasks.tasks || [];
    $scope.pages = tasks.pages;
    $scope.responsible = tasks.responsible;
    $scope.users = users;

    $scope.defaultTime = function () {
        $scope.start =  $filter('date')($scope.start||new Date(),"yyyy-MM-dd");
        $scope.end =  $filter('date')($scope.end||new Date(),"yyyy-MM-dd");
    };
    $scope.clearTime = function () {
        $scope.start =  '';
        $scope.end =  '';
    };
    $scope.defaultTime();
    $scope.responsible ? $scope.clearTime() : '';

    $scope.setResponsible = function(user) {
        $scope.responsible = user.id;
        $scope.responsible_name = user.first_name +' '+ user.last_name;
    };
    $scope.responsible ? $scope.setResponsible($filter('filter')($scope.users, {id : $scope.responsible})[0]) : '';
    $scope.openStart = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedStart = true;
    };
    $scope.openEnd = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedEnd = true;
    };
    $scope.sendFilter = function () {
		$scope.show_load = true;

        var obj = {};
        $scope.start ? obj.time_term_from =  $filter('date')($scope.start,"yyyy-MM-dd") : '';
        $scope.end ? obj.time_term_to =  $filter('date')($scope.end,"yyyy-MM-dd") : '';
        $scope.responsible ? obj.responsible = $scope.responsible : '';
        $scope.status || obj.status === 0 ? obj.status = $scope.status : '';
		$scope.page ? obj.page = $scope.page : '';
        $http({
            url: 'php/view_task_list.php',
            method: "GET",
            params: obj
        }).success(function(data, status, headers, config) {
            if(data.status === "ok") {
				$scope.tasks = data.response.tasks;
				$scope.pages = data.response.pages;
            } else if(data.status === "surprise"){
                $scope.tasks = [];
            }
			$scope.show_load = false;
            //$location.path('/');
        });
		
    };
	$scope.setPage = function(n) {
		$scope.page = n;
		$scope.sendFilter();
	};
})
.controller('ProfileCtrl', function ($scope, users, tasks, $cookies, $filter, $http) {
    $scope.tasks = tasks.tasks || [];
    $scope.current_user = $cookies.user_id;
    $scope.current_date = $filter('date')(new Date(), "yyyy-MM-dd");
    $scope.pages = tasks.pages;
    $scope.users = users;
	$scope.status = $cookies.user_state || 0;
    $scope.checkDate = function (date) {
        var data = $filter('date')(date, "yyyy-MM-dd");
        console.log('curr',$scope.current_date);
        console.log('date',data);
        return data === $scope.current_date;
    }
	$scope.changeStatus = function () {
        $scope.show_load = true;
        var st = $scope.status !== '1' ? $scope.status = '1':$scope.status = '0';
		$http.get('php/change_user_state.php?state='+ st).success(function () {
            $scope.show_load = false;
        });
	}
})
.controller('AuthCtrl', function($scope, users, $http, $location) {
    $scope.users = users;
    $scope.obj = {};
    $scope.obj.index = 0;
    $scope.setUser = function(user) {
        $scope.user_id = user.id;
        $scope.user_name = user.first_name + ' '+ user.last_name;
        $scope.show_list = false;
    };
    $scope.auth = function() {
		$scope.show_load = true;
        $http({
            method: 'POST',
            url: 'php/auth.php',
            data: $.param({
                'user_id': $scope.user_id,
                'user_pwd': $scope.user_pwd
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
        success(function(data, status, headers, config) {
                //console.log(data);
                if(data.status === "ok") {
                    $location.path('/');
                } else {
					$scope.show_load = false;
					alert('Пароль не подходит');
				}
            //$location.path('/');
        }).
        error(function(data, status, headers, config) {
		
            console.log(status);
        });
    };

})
.controller('ViewCtrl', function($scope, task, users,$upload, $http, $route, $cookies) {
    var i,j;
    $scope.obj={};
    $scope.coment = {};
    $scope.obj.length = 0;
    $scope.obj.coment_length = 0;
    $scope.task = task;
    $scope.coment.task_id = task.id;
    $scope.users = users;
    $scope.current_user = $cookies.user_id;
    $scope.task.notified = [];
    for(i = 0;$scope.task.notifications.length > i; i += 1) {
        if($scope.task.notifications[i].comment === '0') {
            $scope.task.notified.push(Number($scope.task.notifications[i].notified));
        } else {
            for(j = 0;$scope.task.comments.length > j; j += 1) {
                if($scope.task.notifications[i].comment === $scope.task.comments[j].id) {
                    $scope.task.comments[j].notified = $scope.task.comments[j].notified || [];
                    $scope.task.comments[j].notified.push(Number($scope.task.notifications[i].notified));
                }
            }
        }
    }
        console.log($scope.task);
    $scope.filterAlreadyAdded = function(item) {
        return $scope.task.notified.indexOf(Number(item.id)) > -1;
    };
    $scope.addNotified = function (item) {
        $scope.name = '';
        $scope.obj.commnetNotified = $scope.obj.commnetNotified || [];
        $scope.obj.commnetNotified.push(Number(item));
        $scope.coment.comment_notified = $scope.obj.commnetNotified;
    };
    $scope.deleteNotified = function (id) {
        $scope.obj.commnetNotified.forEach(function(item,i) {
            if(item === Number(id)) {
                $scope.obj.commetNotified.splice(i,1);

            }
            $scope.coment.comment_notified = $scope.obj.commnetNotified;
        });
    };
    $scope.changeStatus = function () {
        $scope.show_load = true;
        $http({
            method: 'POST',
            url: 'php/change_task_status.php',
            data: $.param({task_status:{id: $scope.task.id, status: 2}}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
        success(function(data, status, headers, config) {
            if(data.status === "ok") {
                $scope.show_load = false;
                $route.reload();
            }
            //$location.path('/');
        });
    };
    $scope.sendComment = function () {
        $scope.show_load = true;
        //$http.put('/new/coment/url', $scope.coment).
        //    success(function(data, status, headers, config) {
        //        $scope.coment = {id : task.id};
        //    }).
        //    error(function(data, status, headers, config) {
        //        console.log(status);
        //    });
        //console.log($scope.coment);
        //if($scope.picFile) {
        //    $scope.coment.img = $scope.picFile[0].name;
        //}

        $http({
            method: 'POST',
            url: 'php/add_comment.php',
            data: $.param({comment: $scope.coment}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
        success(function(data, status, headers, config) {
            //console.log(data);
            if(data.status === "ok") {
                //$location.path('/');
                $scope.coment = {id : task.id};
                $route.reload();
            }
            //$location.path('/');
        }).
        error(function(data, status, headers, config) {
            console.log(status);
        });
    };
    $scope.$watch('picFile', function() {
        if($scope.picFile) {
            var file = $scope.picFile;
            $scope.upload = $upload.upload({
                url: 'php/save_picture.php',
                //data: {myObj: $scope.myModelObj},
                file: file
            }).progress(function(evt) {
                console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);
            }).success(function(data, status, headers, config) {
                if(data.status === "ok") {
                    $scope.coment.img = data.response.picture_name;
                }
                console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
            }).error(function(data, status) {
                console.log(status);
            });
        }
    });
})
.controller('CreateCtrl', function($scope, users, $upload, $http, $filter, $cookies, $location) {
    $scope.obj={};
    $scope.task={destination:'timeline'};
    $scope.userRole = $cookies.user_role;
    $scope.obj.length = 0;
    $scope.users = users;
    $scope.filterAlreadyAdded = function(item) {
        return $scope.task.notified.indexOf(Number(item.id)) > -1;
    };
    $scope.addNotified = function (item) {
        $scope.name = '';
        $scope.obj.commnetNotified = $scope.obj.commnetNotified || [];
        $scope.obj.commnetNotified.push(Number(item));
        $scope.task.task_notified = $scope.obj.commnetNotified;
    };
    $scope.deleteNotified = function (id) {
        $scope.obj.commnetNotified.forEach(function(item,i) {
            if(item === Number(id)) {
                $scope.obj.commnetNotified.splice(i,1);
            }
        });
        $scope.task.commnetNotified = $scope.obj.commnetNotified;
    };
    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };
    $scope.saveTask = function () {
        $scope.show_load = true;
        $scope.task.time_term = $filter('date')($scope.dt||new Date(),"yyyy-MM-dd") + ' ' + ($scope.hours||'00') + ':' +($scope.minutes||'00')+':' +'00';
        $http({
            method: 'POST',
            url: 'php/add_new_task.php',
            data: $.param({task: $scope.task}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
        success(function(data, status, headers, config) {
            $scope.task = {};
            $scope.show_load = true;
            //if()
            $location.path('/#/profile');
        }).
        error(function(data, status, headers, config) {
            console.log(status);
        });
    };
    $scope.setResponsible = function(user) {
        $scope.task.responsible = user.id;
        $scope.responsible_name = user.first_name +' '+ user.last_name;
    };
    //$scope.$watch('dt', function() {
    //
    //});
    $scope.$watch('picFile', function() {
        if($scope.picFile) {
            var file = $scope.picFile;
            $scope.upload = $upload.upload({
                url: 'php/save_picture.php',
                //data: {myObj: $scope.myModelObj},
                file: file
            }).progress(function(evt) {
                console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);
            }).success(function(data, status, headers, config) {
                if(data.status === "ok") {
                    $scope.task.img = data.response.picture_name;
                }
                console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
            }).error(function(data, status) {
                console.log(status);
            });
        }
    });
})
.controller('EditCtrl', function($scope, users, task, $upload, $http, $filter,$route) {
    var i;
    $scope.obj={};
    //$scope.task={status:0};
    $scope.task = task;
    delete $scope.task.comments;
    delete $scope.task.notifications;

    $scope.obj.commnetNotified = [];
    //for(i = 0;users.length > i; i += 1) {
    //    //console.log($scope.responsible);
    //    if(users[i].id === $scope.task.responsible) {
    //        $scope.responsible_name = users[i].first_name + ' ' + users[i].last_name;
    //    }
    //}
    //for(i = 0;$scope.task.notifications.length > i; i += 1) {
    //    if($scope.task.notifications[i].comment === '0') {
    //        $scope.obj.commnetNotified.push(Number($scope.task.notifications[i].notified));
    //    }
    //}
    $scope.dt = $scope.task.time_term;
    $scope.hours = $filter('date')($scope.task.time_term,"HH");
    $scope.minutes = $filter('date')($scope.task.time_term,"mm");
    $scope.obj.length = 0;
    $scope.users = users;
    $scope.responsible_name = $filter('filter')($scope.users,{id:$scope.task.responsible})[0].first_name +' '+ $filter('filter')($scope.users,{id:$scope.task.responsible})[0].last_name;
    //console.log($filter('filter')($scope.users,{id:$scope.task.responsible}));
    $scope.filterAlreadyAdded = function(item) {
        return $scope.task.notified.indexOf(Number(item.id)) > -1;
    };
    $scope.addNotified = function (item) {
        $scope.name = '';
        $scope.obj.commnetNotified = $scope.obj.commnetNotified || [];
        $scope.obj.commnetNotified.push(Number(item));
        $scope.task.commnetNotified = $scope.obj.commnetNotified;
    };
    $scope.deleteNotified = function (id) {
        $scope.obj.commnetNotified.forEach(function(item,i) {
            if(item === Number(id)) {
                $scope.obj.commnetNotified.splice(i,1);
            }
        });
        $scope.task.commnetNotified = $scope.obj.commnetNotified;
    };
    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };
    $scope.saveTask = function () {
        $scope.show_load = true;
        $scope.task.time_term = $filter('date')($scope.dt||new Date(),"yyyy-MM-dd") + ' ' + ($scope.hours||'00') + ':' +($scope.minutes||'00')+':' +'00';
        $http({
            method: 'POST',
            url: 'php/edit_task.php',
            data: $.param({task: $scope.task}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
        success(function(data, status, headers, config) {
                //$scope.show_load = false;
                $route.reload();
        }).
        error(function(data, status, headers, config) {
            console.log(status);
        });
    };
    $scope.setResponsible = function(user) {
        $scope.task.responsible = user.id;
        $scope.responsible_name = user.first_name +' '+ user.last_name;
    };
    $scope.$watch('picFile', function() {
        console.log($scope.picFile);
        if($scope.picFile) {
            var file = $scope.picFile;
            $scope.upload = $upload.upload({
                url: 'php/save_picture.php',
                file: file
            }).progress(function(evt) {
                console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);
            }).success(function(data, status, headers, config) {
                console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
            }).error(function(data, status) {
                console.log(status);
            });
        }
    });
})
.filter('map', function() {
    return function(input, arr, reverse) {
        var result = [];
        arr = arr || [];
        //console.log(arr);
        for (var i = 0; i < input.length; i++) {
            if(reverse) {
                if(arr.indexOf(Number(input[i].id)) == -1) {
                    result.push(input[i]);
                }
                //console.log(arr.indexOf(Number(input[i].id)));
            } else {
                if(arr.indexOf(Number(input[i].id)) > -1) {
                    result.push(input[i]);
                }
            }
        }
        return result;
    };
})
.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i+1);
        return input;
    };
});
