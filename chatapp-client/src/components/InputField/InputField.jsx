// import { Input } from "@mui/base/Input";
import { Button } from "@mui/base/Button";
import './InputField.css'


const InputField = ({ message, setMessage, sendMessage }) => {


  return (
      <div className='input-field'>
        <div className="input-area">
          <form onSubmit={sendMessage} className="input-container">
            <input
              placeholder="Type in here…"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              multiline={false}
              rows={1}
              className='inputfield-input'
            />
            <Button
              disabled={message === ""}
              type="submit"
              className="send-button"
            >
              send
            </Button>
          </form>
        </div>
      </div>
  )
}

export default InputField