document.addEventListener('DOMContentLoaded', () =>{
	//question_html = render_view("#quizView");
	//document.querySelector("#questionCon").innerHTML = question_html;
	//create_question_view(0)
	document.querySelector("#questionCon").onclick = (e) => {
	handle_question(e)
	}
	start_timer()
});

const app_state = {
	nextQnum :-1,
	qnum:0,
	question_correct : 0,
	question_false : 0,
	user_name:"",
	quiz:0,
	active: true
}

const start_timer = () => {
	if (app_state.active){
		var timer = document.getElementById('timer').innerHTML;
		var arr = timer.split(":");
		var hour = arr[0];
		var min = arr[1];
		var sec = arr[2];

		if (sec == 59){
			if(min == 59){
				hour ++
				min = 0;
				if(hour < 10) hour = "0" + hour
			} else {
				min++;
			}
			if (min < 10) min = "0" + min;
			sec = 0;
		}	else {
			sec++;
			if (sec < 10) sec = "0" + sec;
		}
		document.getElementById('timer').innerHTML = hour + ":" + min + ":" + sec;
		setTimeout(start_timer, 1000);
	}
}

const changeState = () =>{
	if (app_state.active == false){
		app_state.active = true;
		console.log('timer active')
	}else {
		app_state.active = false;
	}
}

const reset_timer = () =>{
	document.getElementById('timer').innerHTML = "00" + ":" + "00" + ":" + "00"
}

const update_heading = () => {
	document.querySelector("#correctHeading").innerHTML = app_state.question_correct + " Correct" ;
	document.querySelector("#incorrectHeading").innerHTML = app_state.question_false + " Incorrect";
}

const nice_message = () =>{
	document.querySelector("#message").classList.remove("hide")
	setTimeout(() => document.querySelector("#message").classList.add("hide"), 1000)
}
const clear_page = () =>{
	document.querySelector("#questionCon").innerHTML = "";
}

const end_test = () =>{
	let grade = (app_state.question_correct)/20
	document.querySelector("#endCon").classList.remove("hide")
	if (grade >= .8){
		document.querySelector("#pass").classList.remove("hide")
		document.querySelector("#pass").innerHTML = "Congratulations " + app_state.user_name + " you passed! \nScore: " + grade* 100 + "%";
	}
	else{
		document.querySelector("#fail").classList.remove("hide")
		document.querySelector("#fail").innerHTML = "Sorry " + app_state.user_name + " you failed.. \nScore: " + grade * 100 + "%";
	}
}

const quiz1 = () =>{
	app_state.quiz = 1
	app_state.qnum = 100
	document.querySelector("#qCon").classList.remove("hide")
	create_question_view(0)
	document.querySelector("#menuCon").classList.add("hide")
	reset_timer()
}
const quiz2 = () =>{
	app_state.quiz = 2
	app_state.qnum = 200
	document.querySelector("#qCon").classList.remove("hide")
	create_question_view(20)
	document.querySelector("#menuCon").classList.add("hide")
	reset_timer()
}
const app_state_reset = () => {
	app_state.question_correct = 0;
	app_state.question_false = 0;
	app_state.qNumber = 0;
	app_state.qnum = 0;
	document.querySelector("#fail").classList.add("hide")
	document.querySelector("#fail").innerHTML = "";
	document.querySelector("#pass").classList.add("hide")
	document.querySelector("#pass").innerHTML = "";
	document.querySelector("#endCon").classList.add("hide")
}

const retry = () => {
	app_state_reset()
	update_heading()
	if(app_state.quiz == 1){
		quiz1()
	}
	else if (app_state.quiz == 2){
		quiz2()
	}
}

const main_menu = () =>{
	app_state_reset()
	menu_visible()
	update_heading()
	document.querySelector("#qCon").classList.add("hide")
}
const menu_visible = () => {
	document.querySelector("#menuCon").classList.remove("hide")
}
const help_visible = () => {
	document.querySelector("#helpCon").classList.remove("hide")
}

const helpDone = () => {
	document.querySelector("#helpCon").classList.add("hide")
	if(app_state.qnum != -1)
		{
			create_question_view(app_state.qnum)
		}
		else
		{
			end_test()
		}
}

const handle_question = async(e) => {
	const data = await fetch("https://cors-anywhere.herokuapp.com/https://cus1172quizapi.herokuapp.com/quiz/check_answer/"+app_state.quiz + "/" + app_state.qnum + "/" + e.target.dataset.correct)
	const model = await data.json()
	console.log(model)
	if(model.correct == true){
		app_state.question_correct += 1
		update_heading()
		nice_message()
		clear_page()
		app_state.qnum = nextQnum
		if(app_state.qnum != -1)
		{
			create_question_view(app_state.qnum)
		}
		else
		{
			end_test()
		}
	}
	else if (model.correct == false)
	{
		app_state.question_false += 1
		update_heading()
		clear_page()
		app_state.qnum = nextQnum
		help_visible()
	}
}

const render_view = (model, view) => {

	template_source = document.querySelector(view).innerHTML
	var template = Handlebars.compile(template_source);
	//var html_widget_element = template({question:questions.question})
	var html_widget_element = template({...model,...app_state})
	return html_widget_element

}

const create_question_view = async (qnum) =>
{
	const data = await fetch("https://cors-anywhere.herokuapp.com/https://cus1172quizapi.herokuapp.com/quiz/"+ app_state.quiz +"/" +app_state.qnum)
	const model = await data.json()
	console.log(model)
	console.log(model[0].meta.next_question)
	nextQnum = model[0].meta.next_question
	if(model[0].data.question_type == "mc"){
		console.log('working MC question')
		const question_html = render_view(model, "#quizView")
		const help_html = render_view(model,"#helpView")
		document.querySelector("#helpCon").innerHTML = help_html;
		document.querySelector("#questionCon").innerHTML = question_html;
		if(model[0].data.picture == '' || model[0].data.picture == undefined)
		{
			document.querySelector("#qPic").classList.add("hide")
		}
		else
		{
			document.querySelector("#qPic").classList.remove("hide")
		}
	}
	else if(model[0].data.question_type == "imageMC")
	{
		const question_html = render_view(model, "#imageMC")
		document.querySelector("#questionCon").innerHTML = question_html;
		const help_html = render_view(model,"#helpView")
		document.querySelector("#helpCon").innerHTML = help_html;
	}

	else if(model[0].data.question_type == "fillIn")
	{
		const question_html = render_view(model, "#fillIn")
		const help_html = render_view(model,"#helpView")
		document.querySelector("#helpCon").innerHTML = help_html;
		document.querySelector("#questionCon").innerHTML = question_html;
		console.log(model.questions[qnum].picture)
		if(model[0].data.picture == '' || model[0].data.picture == undefined)
		{
			document.querySelector("#qPic").classList.add("hide")
		}
		else
		{
			document.querySelector("#qPic").classList.remove("hide")
		}

	}
}

const fillInCheck = async() => {
		const answerInput = document.querySelector('#answer');
		const data = await fetch("https://cors-anywhere.herokuapp.com/https://cus1172quizapi.herokuapp.com/quiz/check_answer/"+app_state.quiz + "/" + app_state.qnum + "/" + answerInput.value)
		const model = await data.json()
			if(model.correct == true)
			{
				app_state.question_correct += 1
				update_heading()
				nice_message()
				clear_page()
				app_state.qnum = nextQnum
				if(app_state.qnum != -1)
				{
					create_question_view(app_state.qnum)
				}
				else
				{
					end_test()
				}
			}
			else{
				app_state.question_false += 1
				update_heading()
				clear_page()
				app_state.qnum = nextQnum
				help_visible()
			}
}


window.onload=function(){
	const nameForm = document.querySelector('#name_form');
	const nameInput = document.querySelector('#fullName');
	nameForm.addEventListener('submit', onSubmit);
	function onSubmit(e){
		e.preventDefault();
		if(nameInput.value === ''){
			alert('Enter a name please.')
		}
		else{
			nameForm.classList.add("hide")
			app_state.user_name = nameInput.value
			document.querySelector("#nameHeading").innerHTML = "Welcome " + app_state.user_name;
			menu_visible()

		}
	}
}
