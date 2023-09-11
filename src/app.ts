//사용자의 입력을 받아 개별 프로젝트 신규 등록을 처리하는 클래스
class ProjectInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		this.templateElement = <HTMLTemplateElement>(
			document.querySelector("#project-input")!
		);
		this.hostElement = <HTMLDivElement>document.querySelector("#app")!;
		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = <HTMLFormElement>importedNode.firstElementChild!;
		this.element.id = "user-input";
		this.attach();

		this.titleInputElement = <HTMLInputElement>document.querySelector("#title");
		this.descriptionInputElement = <HTMLInputElement>(
			document.querySelector("#description")
		);
		this.peopleInputElement = <HTMLInputElement>(
			document.querySelector("#people")
		);
		this.configure();
	}
	private attach() {
		this.hostElement.insertAdjacentElement("afterbegin", this.element);
	}
	private configure() {
		this.element.addEventListener("submit", this.submitHandler.bind(this));
	}
	private submitHandler(event: Event) {
		event.preventDefault();
		console.log(this.titleInputElement.value);
		console.log(this.descriptionInputElement.value);
		console.log(this.peopleInputElement.value);
	}
}

//인스턴스 실행
const prjInput = new ProjectInput();
